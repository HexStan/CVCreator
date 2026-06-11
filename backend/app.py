import os

from flask import Flask, send_from_directory
from flask_cors import CORS

from config import SECRET_KEY, SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS, INSTANCE_DIR, STATIC_DIR
from models import db


def create_app():
    os.makedirs(INSTANCE_DIR, exist_ok=True)

    app = Flask(__name__)
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

    cors_origins_raw = os.environ.get('CORS_ORIGINS')
    if cors_origins_raw:
        cors_origins = [o.strip() for o in cors_origins_raw.split(',') if o.strip()]
    else:
        cors_origins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
        ]

    CORS(app, supports_credentials=True, origins=cors_origins)

    db.init_app(app)

    from auth import auth_bp
    from api import api_bp
    from fonts_api import fonts_bp
    from export_api import export_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(fonts_bp, url_prefix='/api/fonts')
    app.register_blueprint(export_bp, url_prefix='/api/export')

    if STATIC_DIR and os.path.isdir(STATIC_DIR):
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_frontend(path):
            if not path:
                return send_from_directory(STATIC_DIR, 'index.html')
            file_path = os.path.join(STATIC_DIR, path)
            if os.path.isfile(file_path):
                return send_from_directory(STATIC_DIR, path)
            return send_from_directory(STATIC_DIR, 'index.html')

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == '__main__':
    debug = os.environ.get('DEBUG', 'true').lower() != 'false'
    app.run(debug=debug, port=5000)
