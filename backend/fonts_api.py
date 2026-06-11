import os

from flask import Blueprint, jsonify, send_from_directory

from config import SYSTEM_FONT_FAMILY_PREFIX
from font_registry import get_registry

fonts_bp = Blueprint('fonts', __name__)


@fonts_bp.route('', methods=['GET'])
def list_fonts():
    registry = get_registry()
    fonts = registry.get_all()
    return jsonify({
        'fonts': [
            {
                'id': f.id,
                'family': f.family,
                'style': f.style,
                'weight': f.weight,
                'label': f.label,
                'url': f'/api/fonts/{f.id}/file',
                'cssFamily': f'{SYSTEM_FONT_FAMILY_PREFIX}{f.id}',
            }
            for f in fonts
        ]
    })


@fonts_bp.route('/<font_id>/file', methods=['GET'])
def serve_font(font_id):
    registry = get_registry()
    font = registry.get(font_id)
    if not font:
        return jsonify({'error': '字体不存在'}), 404

    directory = os.path.dirname(font.cached_path)
    filename = os.path.basename(font.cached_path)
    return send_from_directory(directory, filename, mimetype='application/octet-stream')
