import os
import json
import numpy as np
from collections import defaultdict
from datetime import datetime

from backend.config import Config
from backend.utils.logger import logger

USE_ML = os.environ.get("USE_ML", "0") == "1"


class ModelManager:
    def __init__(self):
        self.models_dir = Config.MODELS_DIR
        os.makedirs(self.models_dir, exist_ok=True)
        self.ready = False
        self._buffers = defaultdict(list)
        self.cnn = None
        self.xgb = None
        self.pipeline = None

        if USE_ML:
            try:
                from backend.ai.cnn_feature_extractor import CNNFeatureExtractor
                from backend.ai.xgboost_classifier import XGBoostClassifier
                from backend.preprocessing.pipeline import PreprocessingPipeline
                self.cnn = CNNFeatureExtractor()
                self.xgb = XGBoostClassifier()
                self.pipeline = PreprocessingPipeline()
                logger.info("ML components imported (USE_ML=1)")
            except Exception as e:
                logger.error(f"ML import failed: {e}", exc_info=True)
                USE_ML_GLOBAL = False
        else:
            logger.info("USE_ML=0, threshold-only predictions active")

    def get_model_paths(self):
        return {
            "cnn": os.path.join(self.models_dir, "cnn_model.h5"),
            "xgb": os.path.join(self.models_dir, "xgboost_model.json"),
            "scaler": os.path.join(self.models_dir, "scaler.joblib"),
        }

    def load_or_train(self, df=None):
        if not USE_ML or not self.cnn:
            logger.info("ML disabled, skipping model load/train")
            self.ready = False
            return

        paths = self.get_model_paths()
        if all(os.path.exists(p) for p in paths.values()):
            logger.info("All models found on disk, loading...")
            self.cnn.load(paths["cnn"])
            self.xgb.load(paths["xgb"])
            self.pipeline.load_scaler(paths["scaler"])
            self.ready = True
            self._warmup()
            return

        if df is None:
            df = self.pipeline.load_csv()
        logger.info("Models not found, training from scratch...")
        X_train, X_val, y_train, y_val = self.pipeline.get_train_test(df)

        self.cnn.build()
        self.cnn.train(X_train, y_train, X_val, y_val, save_path=paths["cnn"])

        cnn_features_train = self.cnn.extract_features(X_train)
        cnn_features_val = self.cnn.extract_features(X_val)

        self.xgb.train(cnn_features_train, y_train, cnn_features_val, y_val)
        self.xgb.save(paths["xgb"])
        self.pipeline.save_scaler(paths["scaler"])
        self.ready = True
        self._warmup()

    def _warmup(self):
        if not self.cnn or not self.xgb:
            return
        try:
            dummy = np.zeros((1, self.pipeline.seq_length, len(Config.SENSOR_FIELDS)), dtype=np.float32)
            cnn_feat = self.cnn.extract_features(dummy)
            self.xgb.predict_with_confidence(cnn_feat)
            logger.info("Model warm-up inference OK")
        except Exception as e:
            logger.error(f"Model warm-up failed: {e}", exc_info=True)

    def predict(self, sensor_record):
        if not USE_ML or not self.pipeline:
            return self._threshold_predict(sensor_record)

        features = self.pipeline.transform_single(sensor_record)
        mid = sensor_record.get("machine_id", "_default")
        buf = self._buffers[mid]
        buf.append(features)
        if len(buf) > self.pipeline.seq_length:
            buf.pop(0)

        if len(buf) < self.pipeline.seq_length:
            threshold_result = self._threshold_predict(sensor_record)
            threshold_result["buffering"] = True
            threshold_result["progress"] = f"{len(buf)}/{self.pipeline.seq_length}"
            return threshold_result

        if self.ready and self.cnn and self.xgb:
            try:
                seq = np.array([buf], dtype=np.float32)
                cnn_feat = self.cnn.extract_features(seq)
                pred, conf = self.xgb.predict_with_confidence(cnn_feat)
                label = Config.FAILURE_CLASSES.get(int(pred[0]), "Unknown")
                return {
                    "predicted_class": int(pred[0]),
                    "predicted_label": label,
                    "confidence": float(conf[0]),
                    "timestamp": datetime.utcnow().isoformat(),
                }
            except Exception as e:
                logger.error(f"ML inference failed, falling back to threshold: {e}", exc_info=True)

        return self._threshold_predict(sensor_record)

    def _threshold_predict(self, record):
        temp = record.get("temperature", 50)
        pressure = record.get("pressure", 100)
        vibration = record.get("vibration_level", 2)
        humidity = record.get("humidity", 60)
        power = record.get("power_consumption", 50)

        score = 0
        if temp > 85: score += 2
        elif temp > 70: score += 1
        if pressure > 140: score += 2
        elif pressure > 120: score += 1
        if vibration > 5: score += 2
        elif vibration > 3: score += 1
        if humidity > 80: score += 1
        if power > 120: score += 1

        if score >= 4:
            cls, label, conf = 2, "Failure", min(0.6 + score * 0.05, 0.95)
        elif score >= 2:
            cls, label, conf = 1, "Warning", min(0.5 + score * 0.05, 0.85)
        else:
            cls, label, conf = 0, "Normal", max(0.9 - score * 0.05, 0.6)

        return {
            "predicted_class": cls,
            "predicted_label": label,
            "confidence": round(conf, 3),
            "timestamp": datetime.utcnow().isoformat(),
        }

    def reset_buffer(self, machine_id=None):
        if machine_id:
            self._buffers.pop(machine_id, None)
        else:
            self._buffers.clear()
