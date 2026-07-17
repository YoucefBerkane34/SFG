import os
import threading
import time as _time
from datetime import datetime
from flask_socketio import SocketIO, emit
from backend.config import Config
from backend.models.database import db, Machine, SensorData, Prediction, Alert
from backend.data.ingestion import DataIngestion
from backend.ai.model_manager import ModelManager
from backend.utils.logger import logger

async_mode = os.getenv("ASYNC_MODE", "eventlet" if os.name != "nt" else "threading")
socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode=async_mode,
    logger=False,
    engineio_logger=False,
    ping_timeout=60,
    ping_interval=25,
)
model_mgr = ModelManager()
ingestion = DataIngestion()
_sim_lock = threading.Lock()
_simulation_active = False

_app = None


def register_socketio_events(app):
    global model_mgr, ingestion, _app
    _app = app

    with app.app_context():
        ensure_machine_exists("M001")
        try:
            model_mgr.load_or_train()
            logger.info("ModelManager ready on startup")
        except Exception as e:
            logger.error(f"ModelManager init FAILED: {e}", exc_info=True)

    @socketio.on("connect")
    def handle_connect():
        logger.info(f"Client connected")

    @socketio.on("disconnect")
    def handle_disconnect():
        logger.info("Client disconnected")

    @socketio.on("start_simulation")
    def start_simulation(data):
        global _simulation_active
        machine_id = data.get("machine_id", "M001")

        if not model_mgr.ready:
            logger.info("Models not ready, attempting load_or_train now...")
            try:
                with app.app_context():
                    model_mgr.load_or_train()
                    logger.info("ModelManager loaded on-demand")
            except Exception as e:
                logger.error(f"On-demand model load FAILED: {e}", exc_info=True)

        if _simulation_active:
            logger.info("Already running, ignoring duplicate start")
            emit("simulation_status", {"status": "started"})
            return

        ingestion._running = True
        _simulation_active = True
        logger.info(f"[STREAM] Starting simulation for {machine_id}")

        socketio.start_background_task(_run_stream, machine_id)
        emit("simulation_status", {"status": "started"})

    @socketio.on("stop_simulation")
    def stop_simulation():
        global _simulation_active
        ingestion.stop_simulation()
        _simulation_active = False
        logger.info("[STREAM] Stop requested")
        emit("simulation_status", {"status": "stopped"})


def _run_stream(machine_id):
    global _simulation_active
    reading_count = 0
    ctx = _app.app_context()
    ctx.push()
    try:
        ensure_machine_exists(machine_id)
        logger.info("[STREAM] App context pushed, machine ensured. Starting loop.")

        for record in ingestion.simulate_live_stream(machine_id=machine_id):
            if not ingestion._running:
                logger.info("[STREAM] ingestion._running is False, breaking")
                break

            reading_count += 1
            result = None
            alert_msg = None
            step_log = f"[STREAM] reading={reading_count}"

            try:
                sensor = SensorData(
                    machine_id=record["machine_id"],
                    timestamp=record["timestamp"],
                    temperature=record.get("temperature"),
                    pressure=record.get("pressure"),
                    vibration_level=record.get("vibration_level"),
                    humidity=record.get("humidity"),
                    power_consumption=record.get("power_consumption"),
                    failure_status=record.get("failure_status", 0),
                )
                db.session.add(sensor)
                db.session.commit()
            except Exception as e:
                logger.error(f"{step_log} DB sensor write FAILED: {e}", exc_info=True)
                try:
                    db.session.rollback()
                except Exception:
                    pass

            try:
                t0 = _time.monotonic()
                result = model_mgr.predict(record)
                elapsed = _time.monotonic() - t0
                buffering = result.get("buffering", False)
                label = result.get("predicted_label", "?")
                conf = result.get("confidence", 0)
                logger.info(
                    f"{step_log} predict OK in {elapsed:.2f}s | "
                    f"buffering={buffering} label={label} conf={conf:.3f}"
                )
            except Exception as e:
                logger.error(f"{step_log} predict CRASHED: {e}", exc_info=True)
                result = {
                    "predicted_class": 0,
                    "predicted_label": "Normal",
                    "confidence": 0.0,
                    "timestamp": datetime.utcnow().isoformat(),
                }

            if result and not result.get("buffering"):
                try:
                    pred = Prediction(
                        machine_id=record["machine_id"],
                        timestamp=record["timestamp"],
                        predicted_class=result["predicted_class"],
                        predicted_label=result["predicted_label"],
                        confidence=result["confidence"],
                        features=str(
                            {k: record.get(k) for k in Config.SENSOR_FIELDS}
                        ),
                    )
                    db.session.add(pred)
                    db.session.commit()
                except Exception as e:
                    logger.error(f"{step_log} DB prediction write FAILED: {e}", exc_info=True)
                    try:
                        db.session.rollback()
                    except Exception:
                        pass

                if result.get("predicted_class") == 2:
                    try:
                        failure_cause = identify_failure_cause(record)
                        alert_msg = Alert(
                            machine_id=record["machine_id"],
                            timestamp=record["timestamp"],
                            severity="critical",
                            message=f"Failure on {record['machine_id']}: {failure_cause}",
                        )
                        db.session.add(alert_msg)
                        db.session.commit()
                        logger.info(f"{step_log} Alert created: {failure_cause}")
                    except Exception as e:
                        logger.error(f"{step_log} DB alert write FAILED: {e}", exc_info=True)
                        try:
                            db.session.rollback()
                        except Exception:
                            pass

            try:
                emit_payload = {
                    "machine_id": record["machine_id"],
                    "timestamp": record["timestamp"].isoformat(),
                    "sensors": {
                        k: record.get(k) for k in Config.SENSOR_FIELDS
                    },
                    "prediction": result,
                }
                if alert_msg:
                    try:
                        emit_payload["alert"] = {
                            "id": alert_msg.id,
                            "severity": alert_msg.severity,
                            "message": alert_msg.message,
                        }
                    except Exception:
                        emit_payload["alert"] = {
                            "id": None,
                            "severity": "critical",
                            "message": alert_msg.message,
                        }
                else:
                    emit_payload["alert"] = None

                socketio.emit("sensor_update", emit_payload)
            except Exception as e:
                logger.error(f"{step_log} socketio.emit FAILED: {e}", exc_info=True)

            if reading_count % 10 == 0:
                logger.info(f"[STREAM] progress: {reading_count} readings processed")

    except GeneratorExit:
        logger.info("[STREAM] Generator closed")
    except Exception as e:
        logger.error(f"[STREAM] Unhandled stream error: {e}", exc_info=True)
    finally:
        _simulation_active = False
        try:
            db.session.remove()
        except Exception:
            pass
        ctx.pop()
        logger.info(f"[STREAM] Done. Total readings: {reading_count}")


def ensure_machine_exists(machine_id):
    if not Machine.query.get(machine_id):
        machine = Machine(id=machine_id, name=f"Machine {machine_id}", status="online")
        db.session.add(machine)
        db.session.commit()
        logger.info(f"Auto-registered machine: {machine_id}")


def identify_failure_cause(record):
    temp = record.get("temperature", 0)
    pressure = record.get("pressure", 0)
    vibration = record.get("vibration_level", 0)
    humidity = record.get("humidity", 0)
    power = record.get("power_consumption", 0)

    causes = []
    if temp > 90:
        causes.append(f"Temperature {temp:.0f}°C (critical)")
    if pressure > 150:
        causes.append(f"Pressure {pressure:.0f} kPa (overload)")
    if vibration > 6:
        causes.append(f"Vibration {vibration:.1f} mm/s (excessive)")
    if humidity > 85:
        causes.append(f"Humidity {humidity:.0f}% (too high)")
    if power > 130:
        causes.append(f"Power {power:.0f} kW (over-consumption)")

    if not causes:
        deviations = sorted(
            [
                ("Temperature", abs(temp - 55), 90),
                ("Pressure", abs(pressure - 105), 150),
                ("Vibration", vibration, 6),
                ("Humidity", abs(humidity - 60), 85),
                ("Power", abs(power - 50), 130),
            ],
            key=lambda x: x[1] / max(x[2], 1),
            reverse=True,
        )
        primary = deviations[0][0]
        causes.append(f"{primary} sensor anomaly")

    return "; ".join(causes[:2])
