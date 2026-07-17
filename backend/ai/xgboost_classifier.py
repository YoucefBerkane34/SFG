import xgboost as xgb
import numpy as np
import json

from backend.utils.logger import logger


class XGBoostClassifier:
    def __init__(self):
        self.model = None
        self.classes_ = [0, 1, 2]

    def train(self, X_train, y_train, X_val=None, y_val=None):
        self.model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="mlogloss",
            random_state=42,
        )
        self.model._estimator_type = "classifier"
        eval_set = [(X_train, y_train)]
        if X_val is not None:
            eval_set.append((X_val, y_val))
        self.model.fit(
            X_train,
            y_train,
            eval_set=eval_set,
            verbose=False,
        )
        logger.info("XGBoost model trained")
        return self.model

    def predict(self, X):
        return self.model.predict(X)

    def predict_proba(self, X):
        return self.model.predict_proba(X)

    def predict_with_confidence(self, X):
        def _do_predict():
            probs = self.predict_proba(X)
            preds = np.argmax(probs, axis=1)
            confs = np.max(probs, axis=1)
            return preds, confs

        try:
            from eventlet import tpool
            return tpool.execute(_do_predict)
        except Exception:
            return _do_predict()

    def save(self, path):
        self.model._estimator_type = "classifier"
        self.model.save_model(path)
        logger.info(f"XGBoost model saved to {path}")

    def load(self, path):
        self.model = xgb.XGBClassifier()
        self.model._estimator_type = "classifier"
        self.model.load_model(path)
        logger.info(f"XGBoost model loaded from {path}")
