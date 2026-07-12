from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Machine(db.Model):
    __tablename__ = "machines"
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default="offline")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    readings = db.relationship("SensorData", backref="machine", lazy=True)
    predictions = db.relationship("Prediction", backref="machine", lazy=True)


class SensorData(db.Model):
    __tablename__ = "sensor_data"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    machine_id = db.Column(
        db.String(50), db.ForeignKey("machines.id"), nullable=False
    )
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    temperature = db.Column(db.Float)
    pressure = db.Column(db.Float)
    vibration_level = db.Column(db.Float)
    humidity = db.Column(db.Float)
    power_consumption = db.Column(db.Float)
    failure_status = db.Column(db.Integer, default=0)


class Prediction(db.Model):
    __tablename__ = "predictions"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    machine_id = db.Column(
        db.String(50), db.ForeignKey("machines.id"), nullable=False
    )
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    predicted_class = db.Column(db.Integer, nullable=False)
    predicted_label = db.Column(db.String(20), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    features = db.Column(db.Text, nullable=True)


class Alert(db.Model):
    __tablename__ = "alerts"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    machine_id = db.Column(
        db.String(50), db.ForeignKey("machines.id"), nullable=False
    )
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    severity = db.Column(db.String(20), default="info")
    message = db.Column(db.Text, nullable=False)
    acknowledged = db.Column(db.Boolean, default=False)
