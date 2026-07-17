import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "smartfactory-guardian-secret")

    _db_url = os.environ.get("DATABASE_URL", "")
    # Render provides postgres://... but SQLAlchemy needs postgresql://...
    if _db_url and _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)

    SQLALCHEMY_DATABASE_URI = _db_url or f"sqlite:///{os.path.join(BASE_DIR, '..', 'data', 'smartguardian.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CSV_PATH = os.environ.get(
        "CSV_PATH",
        os.path.join(BASE_DIR, "..", "data", "machine_failure_data.csv"),
    )
    CSV_3CLASS_PATH = os.environ.get(
        "CSV_3CLASS_PATH",
        os.path.join(BASE_DIR, "..", "data", "machine_failure_3class.csv"),
    )
    MODELS_DIR = os.environ.get(
        "MODELS_DIR",
        os.path.join(BASE_DIR, "..", "models"),
    )
    SENSOR_FIELDS = [
        "temperature",
        "pressure",
        "vibration_level",
        "humidity",
        "power_consumption",
    ]
    FAILURE_CLASSES = {0: "Normal", 1: "Warning", 2: "Failure"}
    SIMULATION_INTERVAL = 2.0
