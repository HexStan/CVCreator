import re

from flask import Blueprint, request, jsonify, session

from models import db, User, Resume

auth_bp = Blueprint('auth', __name__)

USERNAME_RE = re.compile(r'^[a-zA-Z0-9_-]{1,64}$')
PASSWORD_MIN_LEN = 6


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '')

    if not USERNAME_RE.match(username):
        return jsonify({'error': '用户名仅支持字母、数字、下划线和连字符'}), 400
    if len(password) < PASSWORD_MIN_LEN:
        return jsonify({'error': f'密码至少需要{PASSWORD_MIN_LEN}个字符'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': '用户名已存在'}), 409

    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    resume = Resume(user_id=user.id)
    db.session.add(resume)
    db.session.commit()

    session['user_id'] = user.id
    session.permanent = True
    return jsonify({'ok': True, 'user': {'id': user.id, 'username': user.username}})


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = data.get('password', '')
    remember = data.get('remember', False)

    if not username or not password:
        return jsonify({'error': '用户名和密码不能为空'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'error': '用户名或密码错误'}), 401

    session['user_id'] = user.id
    session.permanent = remember
    return jsonify({'ok': True, 'user': {'id': user.id, 'username': user.username}})


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'ok': True})


@auth_bp.route('/username', methods=['PUT'])
def change_username():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '未登录'}), 401

    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({'error': '未登录'}), 401

    data = request.get_json(silent=True) or {}
    new_username = (data.get('username') or '').strip()
    password = (data.get('password') or '')

    if not user.check_password(password):
        return jsonify({'error': '当前密码错误'}), 403

    if not USERNAME_RE.match(new_username):
        return jsonify({'error': '用户名仅支持字母、数字、下划线和连字符'}), 400

    if user.username == new_username:
        return jsonify({'error': '新用户名与当前用户名相同'}), 400

    if User.query.filter_by(username=new_username).first():
        return jsonify({'error': '用户名已存在'}), 409

    user.username = new_username
    db.session.commit()

    return jsonify({'ok': True, 'user': {'id': user.id, 'username': user.username}})


@auth_bp.route('/password', methods=['PUT'])
def change_password():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '未登录'}), 401

    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({'error': '未登录'}), 401

    data = request.get_json(silent=True) or {}
    current_password = (data.get('currentPassword') or '')
    new_password = (data.get('newPassword') or '')

    if not user.check_password(current_password):
        return jsonify({'error': '当前密码错误'}), 403

    if len(new_password) < PASSWORD_MIN_LEN:
        return jsonify({'error': f'密码至少需要{PASSWORD_MIN_LEN}个字符'}), 400

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'ok': True})


@auth_bp.route('/me', methods=['GET'])
def me():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'user': None})
    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({'user': None})
    return jsonify({'user': {'id': user.id, 'username': user.username}})
