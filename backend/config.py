import os
from urllib.parse import urlparse, urlunparse, quote

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _build_database_uri():
    raw = (os.environ.get("DATABASE_URL") or "").strip()
    if not raw:
        return f"sqlite:///{os.path.join(BASE_DIR, '..', 'data', 'smartguardian.db')}"

    # Normalize scheme so urlparse handles it
    if raw.startswith("postgres://"):
        raw = "postgresql://" + raw[len("postgres://"):]

    try:
        parsed = urlparse(raw)
        if parsed.scheme not in ("postgresql", "postgres"):
            return f"sqlite:///{os.path.join(BASE_DIR, '..', 'data', 'smartguardian.db')}"

        user = parsed.username or ""
        password = parsed.password or ""
        host = parsed.hostname or ""
        port = parsed.port or 5432
        database = (parsed.path or "/").lstrip("/")

        # Re-encode credentials to survive special characters in the password
        creds = ""
        if user:
            creds = quote(user, safe="")
            if password:
                creds += ":" + quote(password, safe="")
            creds += "@"

        uri = f"postgresql+psycopg2://{creds}{host}:{port}/{database}"

        # Render PostgreSQL requires SSL
        query = parsed.query or ""
        if "sslmode=" not in query:
            query = (query + "&" if query else "") + "sslmode=require"
        if query:
            uri += "?" + query

        return uri
    except Exception:
        return f"sqlite:///{os.path.join(BASE_DIR, '..', 'data', 'smartguardian.db')}"


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "smartfactory-guardian-secret")

    SQLALCHEMY_DATABASE_URI = _build_database_uri()
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
