import functools
from flask import session, request, jsonify
from database import get_db

def get_current_user():
    """Retrieve current logged in user dict from session or Authorization header."""
    user_id = session.get('user_id')
    
    # Also support Authorization: Bearer <user_id> for API clients/testing
    if not user_id and request.headers.get('Authorization'):
        auth_header = request.headers.get('Authorization')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            if token.isdigit():
                user_id = int(token)

    if not user_id:
        return None

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, username, email, full_name, bio, avatar_url, role, created_at 
        FROM users WHERE id = ?
    """, (user_id,))
    user = cursor.fetchone()
    conn.close()

    if user:
        return dict(user)
    return None

def login_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'Authentication required. Please log in.'}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'Authentication required.'}), 401
        if current_user.get('role') != 'admin':
            return jsonify({'error': 'Admin privileges required.'}), 403
        return f(*args, **kwargs)
    return decorated_function
