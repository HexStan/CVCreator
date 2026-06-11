import os
import secrets

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_DIR = os.environ.get('DATA_DIR', os.path.join(BASE_DIR, 'instance'))

SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    SECRET_KEY = secrets.token_hex(32)
    print('WARNING: SECRET_KEY not set, using random value. Set SECRET_KEY in production.')

SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(INSTANCE_DIR, 'resume.db')}"
SQLALCHEMY_TRACK_MODIFICATIONS = False

FONTS_DIR = os.environ.get('FONTS_DIR', os.path.join(BASE_DIR, 'fonts'))
FONTS_CACHE_DIR = os.path.join(INSTANCE_DIR, 'fonts_cache')
STATIC_DIR = os.environ.get('STATIC_DIR')
MAX_CONTENT_LENGTH = 16 * 1024 * 1024

ALLOWED_FONT_EXTENSIONS = {'.ttf', '.otf', '.ttc', '.otc'}
SYSTEM_FONT_FAMILY_PREFIX = 'SysFont-'
