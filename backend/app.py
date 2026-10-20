import os
from flask import Flask
from flask_cors import CORS

from backend.config import Config
from backend.models.database import db
from backend.routes.api import api_bp
from backend.routes.socketio_events import socketio, register_socketio_events
from backend.utils.logger import logger


def create_app():
    logger.info("create_app() starting...")
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"/*": {"origins": "*"}})

    uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    scheme = uri.split("://")[0] if "://" in uri else uri
    logger.info(f"Database: {scheme}")

    db.init_app(app)

    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables created")
        except Exception as e:
            logger.error(f"db.create_all() failed: {e}", exc_info=True)

    app.register_blueprint(api_bp)
    socketio.init_app(app)
    register_socketio_events(app)

    logger.info("create_app() complete")
    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
