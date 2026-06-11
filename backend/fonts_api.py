import os
import uuid

from flask import Blueprint, request, jsonify, session, send_from_directory

from config import FONTS_DIR, ALLOWED_FONT_EXTENSIONS
from models import db, Font

fonts_bp = Blueprint('fonts', __name__)


def get_current_user_id():
    return session.get('user_id')


def require_user():
    user_id = get_current_user_id()
    if not user_id:
        return None, (jsonify({'error': '未登录'}), 401)
    return user_id, None


@fonts_bp.route('', methods=['GET'])
def list_fonts():
    user_id, err = require_user()
    if err:
        return err

    fonts = Font.query.filter_by(user_id=user_id).order_by(Font.uploaded_at.desc()).all()
    return jsonify({
        'fonts': [
            {
                'id': f.id,
                'originalName': f.original_name,
                'format': f.format,
                'url': f'/api/fonts/{f.id}/file',
                'uploadedAt': f.uploaded_at.isoformat() if f.uploaded_at else None,
            }
            for f in fonts
        ]
    })


@fonts_bp.route('/upload', methods=['POST'])
def upload_font():
    user_id, err = require_user()
    if err:
        return err

    if 'file' not in request.files:
        return jsonify({'error': '未选择文件'}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({'error': '未选择文件'}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_FONT_EXTENSIONS:
        return jsonify({'error': f'不支持的字体格式: {ext}'}), 400

    user_fonts_dir = os.path.join(FONTS_DIR, user_id)
    os.makedirs(user_fonts_dir, exist_ok=True)

    font_id = str(uuid.uuid4())
    saved_filename = f'{font_id}{ext}'
    file_path = os.path.join(user_fonts_dir, saved_filename)
    file.save(file_path)

    font_record = Font(
        id=font_id,
        user_id=user_id,
        filename=saved_filename,
        original_name=file.filename,
        format=ext.lstrip('.'),
    )
    db.session.add(font_record)
    db.session.commit()

    return jsonify({
        'ok': True,
        'font': {
            'id': font_record.id,
            'originalName': font_record.original_name,
            'format': font_record.format,
            'url': f'/api/fonts/{font_record.id}/file',
        }
    })


@fonts_bp.route('/<font_id>', methods=['DELETE'])
def delete_font(font_id):
    user_id, err = require_user()
    if err:
        return err

    font = Font.query.filter_by(id=font_id, user_id=user_id).first()
    if not font:
        return jsonify({'error': '字体不存在'}), 404

    user_fonts_dir = os.path.join(FONTS_DIR, user_id)
    file_path = os.path.join(user_fonts_dir, font.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.session.delete(font)
    db.session.commit()

    return jsonify({'ok': True})


@fonts_bp.route('/<font_id>/file', methods=['GET'])
def serve_font(font_id):
    font = Font.query.get(font_id)
    if not font:
        return jsonify({'error': '字体不存在'}), 404

    fonts_dir = os.path.join(FONTS_DIR, font.user_id)
    return send_from_directory(fonts_dir, font.filename, mimetype='application/octet-stream')
