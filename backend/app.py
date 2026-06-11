import os

from flask import Flask
from flask_cors import CORS

from config import SECRET_KEY, SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS, INSTANCE_DIR
from models import db


def create_app():
    os.makedirs(INSTANCE_DIR, exist_ok=True)

    app = Flask(__name__)
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

    CORS(app, supports_credentials=True, origins=[
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ])

    db.init_app(app)

    from auth import auth_bp
    from api import api_bp
    from fonts_api import fonts_bp
    from export_api import export_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(fonts_bp, url_prefix='/api/fonts')
    app.register_blueprint(export_bp, url_prefix='/api/export')

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
