import os
import secrets
from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

from database import init_db, get_db
from auth import get_current_user, login_required, admin_required
import models

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.urandom(24).hex()
CORS(app)

# Ensure DB is ready when app starts
init_db()

# --- MAIN ROUTE ---
@app.route('/')
def index():
    return render_template('index.html')

# --- AUTH REST APIs ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    full_name = data.get('full_name', '').strip() or username
    bio = data.get('bio', '').strip()
    avatar_url = data.get('avatar_url', '').strip() or f"https://api.dicebear.com/7.x/bottts/svg?seed={username}"

    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Check for existing user
    cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Username or email already registered.'}), 400

    password_hash = generate_password_hash(password)
    cursor.execute(
        "INSERT INTO users (username, email, password_hash, full_name, bio, avatar_url, role) VALUES (?, ?, ?, ?, ?, ?, 'user')",
        (username, email, password_hash, full_name, bio, avatar_url)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    session['user_id'] = user_id

    current_user = models.get_user_profile(user_id)
    return jsonify({
        'message': 'Registration successful.',
        'user': current_user
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    login_id = data.get('login', '').strip()
    password = data.get('password', '').strip()

    if not login_id or not password:
        return jsonify({'error': 'Please provide username/email and password.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ? OR email = ?", (login_id, login_id.lower()))
    user_row = cursor.fetchone()
    conn.close()

    if not user_row or not check_password_hash(user_row['password_hash'], password):
        return jsonify({'error': 'Invalid credentials.'}), 401

    session['user_id'] = user_row['id']
    user_profile = models.get_user_profile(user_row['id'])

    return jsonify({
        'message': 'Login successful.',
        'user': user_profile
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully.'})

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    user = get_current_user()
    if not user:
        return jsonify({'user': None})
    profile = models.get_user_profile(user['id'])
    return jsonify({'user': profile})

@app.route('/api/auth/profile', methods=['PUT'])
@login_required
def update_profile():
    current_user = get_current_user()
    data = request.get_json() or {}

    full_name = data.get('full_name', '').strip() or current_user['username']
    bio = data.get('bio', '').strip()
    avatar_url = data.get('avatar_url', '').strip() or current_user['avatar_url']

    models.update_user_profile(current_user['id'], full_name, bio, avatar_url)
    updated_user = models.get_user_profile(current_user['id'])

    return jsonify({
        'message': 'Profile updated successfully.',
        'user': updated_user
    })

# --- POST REST APIs ---

@app.route('/api/posts', methods=['GET'])
def list_posts():
    current_user = get_current_user()
    user_id = current_user['id'] if current_user else None

    query = request.args.get('q')
    category = request.args.get('category')
    tag = request.args.get('tag')
    author_id = request.args.get('author_id')
    status = request.args.get('status', 'published')

    # Non-authenticated or normal users can only list published posts unless querying their own
    if status != 'published' and (not current_user or (author_id and int(author_id) != current_user['id'] and current_user['role'] != 'admin')):
        status = 'published'

    limit = request.args.get('limit', 20, type=int)
    offset = request.args.get('offset', 0, type=int)

    posts = models.get_posts(
        query=query, 
        category=category, 
        tag=tag, 
        author_id=author_id, 
        status=status, 
        current_user_id=user_id,
        limit=limit, 
        offset=offset
    )

    return jsonify({'posts': posts, 'count': len(posts)})

@app.route('/api/posts/<identifier>', methods=['GET'])
def get_post_detail(identifier):
    current_user = get_current_user()
    user_id = current_user['id'] if current_user else None

    post = models.get_post_by_id_or_slug(identifier, current_user_id=user_id, increment_views=True)
    if not post:
        return jsonify({'error': 'Post not found.'}), 404

    # If post is draft, check authorization
    if post['status'] != 'published':
        if not current_user or (post['author_id'] != current_user['id'] and current_user['role'] != 'admin'):
            return jsonify({'error': 'Post not found or access denied.'}), 404

    return jsonify({'post': post})

@app.route('/api/posts', methods=['POST'])
@login_required
def create_post_route():
    current_user = get_current_user()
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    summary = data.get('summary', '').strip()
    category_id = data.get('category_id')
    cover_image = data.get('cover_image', '').strip()
    tags = data.get('tags', [])
    status = data.get('status', 'published')

    if not title or not content:
        return jsonify({'error': 'Title and content are required.'}), 400

    if status not in ['published', 'draft']:
        status = 'published'

    post_id = models.create_post(
        title=title,
        content=content,
        summary=summary or content[:150] + '...',
        category_id=category_id,
        author_id=current_user['id'],
        cover_image=cover_image or 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
        tags=tags,
        status=status
    )

    created_post = models.get_post_by_id_or_slug(post_id, current_user_id=current_user['id'], increment_views=False)
    return jsonify({'message': 'Post created successfully.', 'post': created_post}), 201

@app.route('/api/posts/<int:post_id>', methods=['PUT'])
@login_required
def update_post_route(post_id):
    current_user = get_current_user()
    post = models.get_post_by_id_or_slug(post_id, current_user_id=current_user['id'], increment_views=False)
    
    if not post:
        return jsonify({'error': 'Post not found.'}), 404

    # Check ownership
    if post['author_id'] != current_user['id'] and current_user['role'] != 'admin':
        return jsonify({'error': 'You do not have permission to edit this post.'}), 403

    data = request.get_json() or {}
    title = data.get('title', '').strip() or post['title']
    content = data.get('content', '').strip() or post['content']
    summary = data.get('summary', '').strip() or post['summary']
    category_id = data.get('category_id', post['category_id'])
    cover_image = data.get('cover_image', '').strip() or post['cover_image']
    tags = data.get('tags', [t['name'] for t in post['tags']])
    status = data.get('status', post['status'])

    models.update_post(
        post_id=post_id,
        title=title,
        content=content,
        summary=summary,
        category_id=category_id,
        cover_image=cover_image,
        tags=tags,
        status=status
    )

    updated_post = models.get_post_by_id_or_slug(post_id, current_user_id=current_user['id'], increment_views=False)
    return jsonify({'message': 'Post updated successfully.', 'post': updated_post})

@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
@login_required
def delete_post_route(post_id):
    current_user = get_current_user()
    post = models.get_post_by_id_or_slug(post_id, current_user_id=current_user['id'], increment_views=False)
    
    if not post:
        return jsonify({'error': 'Post not found.'}), 404

    if post['author_id'] != current_user['id'] and current_user['role'] != 'admin':
        return jsonify({'error': 'You do not have permission to delete this post.'}), 403

    models.delete_post(post_id)
    return jsonify({'message': 'Post deleted successfully.'})

@app.route('/api/posts/<int:post_id>/like', methods=['POST'])
@login_required
def like_post_route(post_id):
    current_user = get_current_user()
    result = models.toggle_post_like(post_id, current_user['id'])
    return jsonify(result)

# --- COMMENT REST APIs ---

@app.route('/api/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    current_user = get_current_user()
    user_id = current_user['id'] if current_user else None
    comments = models.get_comments_for_post(post_id, current_user_id=user_id)
    return jsonify({'comments': comments, 'count': len(comments)})

@app.route('/api/posts/<int:post_id>/comments', methods=['POST'])
@login_required
def add_comment(post_id):
    current_user = get_current_user()
    data = request.get_json() or {}
    content = data.get('content', '').strip()
    parent_id = data.get('parent_id')

    if not content:
        return jsonify({'error': 'Comment content cannot be empty.'}), 400

    comment = models.create_comment(
        post_id=post_id,
        author_id=current_user['id'],
        content=content,
        parent_id=parent_id
    )

    if not comment:
        return jsonify({'error': 'Failed to add comment. Invalid parent comment.'}), 400

    return jsonify({'message': 'Comment added successfully.', 'comment': comment}), 201

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@login_required
def delete_comment_route(comment_id):
    current_user = get_current_user()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.author_id, p.author_id as post_author_id 
        FROM comments c 
        JOIN posts p ON c.post_id = p.id 
        WHERE c.id = ?
    """, (comment_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({'error': 'Comment not found.'}), 404

    # Allow comment author, post author, or admin to delete comment
    if current_user['id'] not in (row['author_id'], row['post_author_id']) and current_user['role'] != 'admin':
        return jsonify({'error': 'Permission denied.'}), 403

    models.delete_comment(comment_id)
    return jsonify({'message': 'Comment deleted successfully.'})

@app.route('/api/comments/<int:comment_id>/like', methods=['POST'])
@login_required
def like_comment_route(comment_id):
    current_user = get_current_user()
    result = models.toggle_comment_like(comment_id, current_user['id'])
    return jsonify(result)

# --- CATEGORY, TAG & STATS APIs ---

@app.route('/api/categories', methods=['GET'])
def get_categories_route():
    categories = models.get_categories()
    return jsonify({'categories': categories})

@app.route('/api/tags', methods=['GET'])
def get_tags_route():
    tags = models.get_tags()
    return jsonify({'tags': tags})

@app.route('/api/stats', methods=['GET'])
def get_stats_route():
    stats = models.get_dashboard_stats()
    return jsonify(stats)

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_public_profile(user_id):
    profile = models.get_user_profile(user_id)
    if not profile:
        return jsonify({'error': 'User not found.'}), 404
    
    # Hide email from public profile view
    profile.pop('email', None)
    return jsonify({'user': profile})

if __name__ == '__main__':
    print("Starting Blog Platform Server on http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)
