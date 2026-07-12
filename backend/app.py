from flask import Flask
from flask_cors import CORS

from backend.config import Config
from backend.models.database import db
from backend.routes.api import api_bp
from backend.routes.socketio_events import socketio, register_socketio_events
from backend.utils.logger import logger


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    db.init_app(app)
    with app.app_context():
        db.create_all()
        logger.info("Database tables created")

    app.register_blueprint(api_bp)
    socketio.init_app(app)
    register_socketio_events(app)

    return app


app = create_app()

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
