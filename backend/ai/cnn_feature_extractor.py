import os
os.environ.setdefault("KERAS_BACKEND", os.environ.get("KERAS_BACKEND", "tensorflow"))
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")

import keras
from keras import layers, models, callbacks
import numpy as np

from backend.utils.logger import logger

try:
    import tensorflow as tf
    tf.config.threading.set_intra_op_parallelism_threads(1)
    tf.config.threading.set_inter_op_parallelism_threads(1)
except Exception:
    pass


class CNNFeatureExtractor:
    def __init__(self, seq_length=10, n_features=5, latent_dim=16):
        self.seq_length = seq_length
        self.n_features = n_features
        self.latent_dim = latent_dim
        self.model = None
        self._extractor = None

    def build(self):
        inputs = layers.Input(shape=(self.seq_length, self.n_features))
        x = layers.Conv1D(32, 3, activation="relu", padding="same")(inputs)
        x = layers.BatchNormalization()(x)
        x = layers.GlobalAveragePooling1D()(x)
        x = layers.Dense(self.latent_dim, activation="relu", name="feature_dense")(x)
        outputs = layers.Dense(3, activation="softmax", name="classifier")(x)

        self.model = models.Model(inputs=inputs, outputs=outputs)
        self.model.compile(
            optimizer="adam",
            loss="sparse_categorical_crossentropy",
            metrics=["accuracy"],
        )
        self._build_extractor()
        logger.info(f"CNN built: input={inputs.shape}, latent_dim={self.latent_dim}")
        return self.model

    def _build_extractor(self):
        if self.model is None:
            return
        feature_layer = self.model.get_layer("feature_dense")
        self._extractor = models.Model(
            inputs=self.model.input, outputs=feature_layer.output
        )

    def extract_features(self, X):
        if self._extractor is None:
            self._build_extractor()
        return self._extractor.predict(X, verbose=0)

    def train(
        self,
        X_train,
        y_train,
        X_val,
        y_val,
        epochs=50,
        batch_size=32,
        save_path=None,
    ):
        cb = [
            callbacks.EarlyStopping(
                monitor="val_loss", patience=5, restore_best_weights=True
            ),
            callbacks.ReduceLROnPlateau(
                monitor="val_loss", factor=0.5, patience=3
            ),
        ]
        history = self.model.fit(
            X_train,
            y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=cb,
            verbose=1,
        )
        if save_path:
            self.model.save(save_path)
            logger.info(f"CNN model saved to {save_path}")
        return history

    def load(self, path):
        self.model = models.load_model(path)
        self._build_extractor()
        logger.info(f"CNN model loaded from {path}")
