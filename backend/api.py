import json
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, session

from models import db, Resume


def _isoformat(dt):
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()

api_bp = Blueprint('api', __name__)


def get_current_user_id():
    return session.get('user_id')


def require_user():
    user_id = get_current_user_id()
    if not user_id:
        return None, (jsonify({'error': '未登录'}), 401)
    return user_id, None


@api_bp.route('/resume', methods=['GET'])
def get_resume():
    user_id, err = require_user()
    if err:
        return err

    resume = Resume.query.filter_by(user_id=user_id).first()
    if not resume:
        return jsonify({'data': {}, 'template': 'classic'})

    return jsonify({
        'data': json.loads(resume.data),
        'template': resume.template,
        'updatedAt': _isoformat(resume.updated_at),
    })


@api_bp.route('/resume', methods=['PUT'])
def save_resume():
    user_id, err = require_user()
    if err:
        return err

    data = request.get_json(silent=True) or {}
    resume = Resume.query.filter_by(user_id=user_id).first()
    if not resume:
        resume = Resume(user_id=user_id)
        db.session.add(resume)

    resume.data = json.dumps(data.get('data', {}), ensure_ascii=False)
    resume.template = data.get('template', resume.template or 'classic')
    resume.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({'ok': True, 'updatedAt': _isoformat(resume.updated_at)})
