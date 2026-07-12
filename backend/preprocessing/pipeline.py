import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import joblib
import os

from backend.config import Config
from backend.utils.logger import logger


class PreprocessingPipeline:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.sensor_fields = Config.SENSOR_FIELDS
        self.seq_length = 10

    def load_csv(self, path=None):
        path_3class = Config.CSV_3CLASS_PATH
        if path is None and os.path.exists(path_3class):
            path = path_3class
            logger.info(f"Using 3-class dataset: {path}")
        path = path or Config.CSV_PATH
        logger.info(f"Loading CSV: {path}")
        df = pd.read_csv(path)
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        return df

    def clean(self, df):
        df = df.dropna(subset=self.sensor_fields + ["failure_status"])
        df = df.drop_duplicates()
        return df

    def create_sequences(self, data, labels):
        X, y = [], []
        for i in range(len(data) - self.seq_length):
            X.append(data[i : i + self.seq_length])
            y.append(labels[i + self.seq_length])
        return np.array(X), np.array(y)

    def fit_transform(self, df, for_training=True):
        df = self.clean(df)
        X_raw = df[self.sensor_fields].values.astype(np.float32)
        y_raw = df["failure_status"].values.astype(int)

        if for_training:
            X_scaled = self.scaler.fit_transform(X_raw)
        else:
            X_scaled = self.scaler.transform(X_raw)

        X_seq, y_seq = self.create_sequences(X_scaled, y_raw)
        logger.info(
            f"Sequence shape: {X_seq.shape}, labels: {y_seq.shape}"
        )
        return X_seq, y_seq

    def transform_single(self, record):
        fields = self.sensor_fields
        arr = np.array([[record.get(f, 0) for f in fields]], dtype=np.float32)
        arr_scaled = self.scaler.transform(arr)
        return arr_scaled[0]

    def save_scaler(self, path):
        joblib.dump(self.scaler, path)
        logger.info(f"Scaler saved to {path}")

    def load_scaler(self, path):
        self.scaler = joblib.load(path)
        logger.info(f"Scaler loaded from {path}")

    def get_train_test(self, df, test_size=0.2):
        X_seq, y_seq = self.fit_transform(df, for_training=True)
        return train_test_split(
            X_seq, y_seq, test_size=test_size, random_state=42
        )
