import os
import json
import numpy as np
from collections import defaultdict
from datetime import datetime

from backend.config import Config
from backend.ai.cnn_feature_extractor import CNNFeatureExtractor
from backend.ai.xgboost_classifier import XGBoostClassifier
from backend.preprocessing.pipeline import PreprocessingPipeline
from backend.utils.logger import logger


class ModelManager:
    def __init__(self):
        self.models_dir = Config.MODELS_DIR
        self.cnn = CNNFeatureExtractor()
        self.xgb = XGBoostClassifier()
        self.pipeline = PreprocessingPipeline()
        self.ready = False
        self._buffers = defaultdict(list)

    def get_model_paths(self):
        return {
            "cnn": os.path.join(self.models_dir, "cnn_model.h5"),
            "xgb": os.path.join(self.models_dir, "xgboost_model.json"),
            "scaler": os.path.join(self.models_dir, "scaler.joblib"),
        }

    def load_or_train(self, df=None):
        paths = self.get_model_paths()
        if all(os.path.exists(p) for p in paths.values()):
            logger.info("All models found on disk, loading...")
            self.cnn.load(paths["cnn"])
            self.xgb.load(paths["xgb"])
            self.pipeline.load_scaler(paths["scaler"])
            self.ready = True
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

    def predict(self, sensor_record):
        if not self.ready:
            raise RuntimeError("Models not loaded. Call load_or_train first.")
        features = self.pipeline.transform_single(sensor_record)
        mid = sensor_record.get("machine_id", "_default")
        buf = self._buffers[mid]
        buf.append(features)
        if len(buf) > self.pipeline.seq_length:
            buf.pop(0)

        if len(buf) < self.pipeline.seq_length:
            return {
                "predicted_class": 0,
                "predicted_label": "Normal",
                "confidence": 0.5,
                "timestamp": datetime.utcnow().isoformat(),
                "buffering": True,
                "progress": f"{len(buf)}/{self.pipeline.seq_length}",
            }

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

    def reset_buffer(self, machine_id=None):
        if machine_id:
            self._buffers.pop(machine_id, None)
        else:
            self._buffers.clear()
