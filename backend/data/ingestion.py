import time
import random
import threading
from datetime import datetime
import pandas as pd

from backend.config import Config
from backend.utils.logger import logger


class DataIngestion:
    def __init__(self):
        self.csv_path = Config.CSV_PATH
        self.data_buffer = []
        self._running = False
        self._thread = None

    def load_csv_data(self):
        path = getattr(Config, "CSV_3CLASS_PATH", None)
        if path and not __import__("os").path.exists(path):
            path = None
        path = path or Config.CSV_PATH
        df = pd.read_csv(path)
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        records = df.to_dict(orient="records")
        logger.info(f"Loaded {len(records)} records from CSV")
        return records

    def simulate_live_stream(self, machine_id="M001", interval=None):
        interval = interval or Config.SIMULATION_INTERVAL
        records = self.load_csv_data()
        idx = 0
        cycle_pos = 0
        self._running = True
        logger.info(f"Starting live simulation for {machine_id}")

        scenarios = [
            {"label": "Normal",  "t_mult": 0.3, "p_mult": 0.4, "v_mult": 0.2, "h_mult": 0.4, "w_mult": 0.2, "duration": 20},
            {"label": "Warning", "t_mult": 0.9, "p_mult": 0.9, "v_mult": 0.8, "h_mult": 0.9, "w_mult": 0.8, "duration": 12},
            {"label": "Failure", "t_mult": 1.6, "p_mult": 1.5, "v_mult": 1.8, "h_mult": 1.4, "w_mult": 1.6, "duration": 8},
        ]

        while self._running:
            scenario = scenarios[cycle_pos % len(scenarios)]
            for _ in range(scenario["duration"]):
                if not self._running:
                    break
                record = records[idx % len(records)].copy()
                record["machine_id"] = machine_id
                record["timestamp"] = datetime.utcnow()
                record["temperature"] *= scenario["t_mult"]
                record["pressure"] *= scenario["p_mult"]
                record["vibration_level"] *= scenario["v_mult"]
                record["humidity"] *= scenario["h_mult"]
                record["power_consumption"] *= scenario["w_mult"]
                noise = {
                    f: random.gauss(0, 0.02 * abs(record.get(f, 1) or 1))
                    for f in Config.SENSOR_FIELDS
                }
                for f in Config.SENSOR_FIELDS:
                    record[f] = round(record.get(f, 0) + noise.get(f, 0), 4)
                record["_scenario"] = scenario["label"]
                yield record
                idx += 1
                time.sleep(interval)
            logger.info(f"Scenario switch → {scenario['label']}")
            cycle_pos += 1

    def stop_simulation(self):
        self._running = False
        logger.info("Simulation stopped")
