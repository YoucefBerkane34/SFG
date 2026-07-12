from flask import Blueprint, request, jsonify
from datetime import datetime

from backend.models.database import db, Machine, SensorData, Prediction, Alert
from backend.utils.logger import logger

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "SmartFactory Guardian"})


@api_bp.route("/machines", methods=["GET"])
def list_machines():
    machines = Machine.query.all()
    return jsonify([
        {
            "id": m.id,
            "name": m.name,
            "status": m.status,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in machines
    ])


@api_bp.route("/machines", methods=["POST"])
def register_machine():
    data = request.get_json()
    mid = data.get("id")
    existing = Machine.query.get(mid)
    if existing:
        return jsonify({"message": "Machine already exists", "id": mid}), 200
    machine = Machine(
        id=mid,
        name=data.get("name", mid),
        status=data.get("status", "offline"),
    )
    db.session.add(machine)
    db.session.commit()
    logger.info(f"Machine registered: {machine.id}")
    return jsonify({"message": "Machine registered", "id": machine.id}), 201


@api_bp.route("/sensor-data", methods=["POST"])
def ingest_sensor_data():
    data = request.get_json()
    machine = Machine.query.get(data.get("machine_id"))
    if not machine:
        return jsonify({"error": "Machine not found"}), 404

    sensor = SensorData(
        machine_id=data["machine_id"],
        timestamp=datetime.fromisoformat(data["timestamp"])
        if data.get("timestamp") else datetime.utcnow(),
        temperature=data.get("temperature"),
        pressure=data.get("pressure"),
        vibration_level=data.get("vibration_level"),
        humidity=data.get("humidity"),
        power_consumption=data.get("power_consumption"),
        failure_status=data.get("failure_status", 0),
    )
    db.session.add(sensor)
    db.session.commit()
    return jsonify({"message": "Data ingested", "id": sensor.id}), 201


@api_bp.route("/predictions/<machine_id>", methods=["GET"])
def get_predictions(machine_id):
    limit = request.args.get("limit", 50, type=int)
    preds = (
        Prediction.query.filter_by(machine_id=machine_id)
        .order_by(Prediction.timestamp.desc())
        .limit(limit)
        .all()
    )
    return jsonify([
        {
            "id": p.id,
            "timestamp": p.timestamp.isoformat(),
            "predicted_class": p.predicted_class,
            "predicted_label": p.predicted_label,
            "confidence": p.confidence,
        }
        for p in preds
    ])


@api_bp.route("/alerts", methods=["GET"])
def get_alerts():
    limit = request.args.get("limit", 50, type=int)
    acks = request.args.get("acknowledged")
    q = Alert.query.order_by(Alert.timestamp.desc())
    if acks is not None:
        q = q.filter_by(acknowledged=acks.lower() == "true")
    alerts = q.limit(limit).all()
    return jsonify([
        {
            "id": a.id,
            "machine_id": a.machine_id,
            "timestamp": a.timestamp.isoformat(),
            "severity": a.severity,
            "message": a.message,
            "acknowledged": a.acknowledged,
        }
        for a in alerts
    ])


@api_bp.route("/alerts/<int:alert_id>/acknowledge", methods=["PATCH"])
def acknowledge_alert(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404
    alert.acknowledged = True
    db.session.commit()
    return jsonify({"message": "Alert acknowledged"})


@api_bp.route("/stats", methods=["GET"])
def get_stats():
    total_readings = SensorData.query.count()
    total_predictions = Prediction.query.count()
    active_alerts = Alert.query.filter_by(acknowledged=False).count()
    machines = Machine.query.count()
    return jsonify({
        "total_readings": total_readings,
        "total_predictions": total_predictions,
        "active_alerts": active_alerts,
        "registered_machines": machines,
    })
