import re
from datetime import datetime
from database import get_db

def slugify(text):
    """Convert text into a URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text or 'post'

def calculate_read_time(content):
    """Calculate reading time in minutes based on 200 WPM."""
    word_count = len(re.findall(r'\w+', content or ''))
    return max(1, round(word_count / 200))

# --- POST OPERATIONS ---

def get_posts(query=None, category=None, tag=None, author_id=None, status='published', current_user_id=None, limit=20, offset=0):
    conn = get_db()
    cursor = conn.cursor()

    sql = """
        SELECT 
            p.id, p.title, p.slug, p.summary, p.content, p.cover_image, 
            p.status, p.read_time_min, p.views_count, p.created_at, p.updated_at,
            c.id as category_id, c.name as category_name, c.slug as category_slug, c.color as category_color,
            u.id as author_id, u.username as author_username, u.full_name as author_name, u.avatar_url as author_avatar,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
            EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        JOIN users u ON p.author_id = u.id
        WHERE 1=1
    """
    params = [current_user_id]

    if status and status != 'all':
        sql += " AND p.status = ?"
        params.append(status)

    if category:
        if category.isdigit():
            sql += " AND p.category_id = ?"
            params.append(int(category))
        else:
            sql += " AND c.slug = ?"
            params.append(category)

    if author_id:
        sql += " AND p.author_id = ?"
        params.append(int(author_id))

    if query:
        sql += " AND (p.title LIKE ? OR p.content LIKE ? OR p.summary LIKE ?)"
        search_pattern = f"%{query}%"
        params.extend([search_pattern, search_pattern, search_pattern])

    if tag:
        sql += " AND p.id IN (SELECT post_id FROM post_tags pt JOIN tags t ON pt.tag_id = t.id WHERE t.name = ?)"
        params.append(tag)

    sql += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(sql, params)
    posts = [dict(row) for row in cursor.fetchall()]

    # Attach tags to posts
    for post in posts:
        cursor.execute("""
            SELECT t.id, t.name FROM tags t
            JOIN post_tags pt ON t.id = pt.tag_id
            WHERE pt.post_id = ?
        """, (post['id'],))
        post['tags'] = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return posts

def get_post_by_id_or_slug(identifier, current_user_id=None, increment_views=True):
    conn = get_db()
    cursor = conn.cursor()

    if str(identifier).isdigit():
        update_condition = "id = ?"
        select_condition = "p.id = ?"
        param = int(identifier)
    else:
        update_condition = "slug = ?"
        select_condition = "p.slug = ?"
        param = str(identifier)

    if increment_views:
        cursor.execute(f"UPDATE posts SET views_count = views_count + 1 WHERE {update_condition}", (param,))
        conn.commit()

    sql = f"""
        SELECT 
            p.id, p.title, p.slug, p.summary, p.content, p.cover_image, 
            p.status, p.read_time_min, p.views_count, p.created_at, p.updated_at,
            c.id as category_id, c.name as category_name, c.slug as category_slug, c.color as category_color,
            u.id as author_id, u.username as author_username, u.full_name as author_name, u.avatar_url as author_avatar, u.bio as author_bio,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
            EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        JOIN users u ON p.author_id = u.id
        WHERE {select_condition}
    """
    cursor.execute(sql, (current_user_id, param))
    row = cursor.fetchone()

    if not row:
        conn.close()
        return None

    post = dict(row)

    # Fetch tags
    cursor.execute("""
        SELECT t.id, t.name FROM tags t
        JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = ?
    """, (post['id'],))
    post['tags'] = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return post

def create_post(title, content, summary, category_id, author_id, cover_image=None, tags=None, status='published'):
    conn = get_db()
    cursor = conn.cursor()

    base_slug = slugify(title)
    slug = base_slug
    counter = 1
    
    # Ensure unique slug
    while True:
        cursor.execute("SELECT id FROM posts WHERE slug = ?", (slug,))
        if not cursor.fetchone():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    read_time = calculate_read_time(content)

    cursor.execute("""
        INSERT INTO posts (title, slug, content, summary, category_id, author_id, cover_image, status, read_time_min)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (title, slug, content, summary, category_id, author_id, cover_image, status, read_time))
    
    post_id = cursor.lastrowid

    # Insert tags
    if tags:
        for tag_name in tags:
            tag_name = tag_name.strip()
            if not tag_name:
                continue
            cursor.execute("INSERT OR IGNORE INTO tags (name) VALUES (?)", (tag_name,))
            cursor.execute("SELECT id FROM tags WHERE name = ?", (tag_name,))
            tag_row = cursor.fetchone()
            if tag_row:
                cursor.execute("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)", (post_id, tag_row['id']))

    conn.commit()
    conn.close()
    return post_id

def update_post(post_id, title, content, summary, category_id, cover_image=None, tags=None, status='published'):
    conn = get_db()
    cursor = conn.cursor()

    read_time = calculate_read_time(content)
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    cursor.execute("""
        UPDATE posts 
        SET title = ?, content = ?, summary = ?, category_id = ?, cover_image = ?, status = ?, read_time_min = ?, updated_at = ?
        WHERE id = ?
    """, (title, content, summary, category_id, cover_image, status, read_time, now, post_id))

    # Reset and update tags
    cursor.execute("DELETE FROM post_tags WHERE post_id = ?", (post_id,))
    if tags:
        for tag_name in tags:
            tag_name = tag_name.strip()
            if not tag_name:
                continue
            cursor.execute("INSERT OR IGNORE INTO tags (name) VALUES (?)", (tag_name,))
            cursor.execute("SELECT id FROM tags WHERE name = ?", (tag_name,))
            tag_row = cursor.fetchone()
            if tag_row:
                cursor.execute("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)", (post_id, tag_row['id']))

    conn.commit()
    conn.close()
    return True

def delete_post(post_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM posts WHERE id = ?", (post_id,))
    conn.commit()
    conn.close()
    return True

def toggle_post_like(post_id, user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?", (post_id, user_id))
    exists = cursor.fetchone()

    if exists:
        cursor.execute("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?", (post_id, user_id))
        liked = False
    else:
        cursor.execute("INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)", (post_id, user_id))
        liked = True

    cursor.execute("SELECT COUNT(*) FROM post_likes WHERE post_id = ?", (post_id,))
    total_likes = cursor.fetchone()[0]

    conn.commit()
    conn.close()
    return {'liked': liked, 'likes_count': total_likes}

# --- COMMENT OPERATIONS ---

def get_comments_for_post(post_id, current_user_id=None):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            c.id, c.post_id, c.author_id, c.parent_id, c.content, c.is_edited, c.created_at,
            u.username as author_username, u.full_name as author_name, u.avatar_url as author_avatar,
            (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as like_count,
            EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c.id AND user_id = ?) as is_liked
        FROM comments c
        JOIN users u ON c.author_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    """, (current_user_id, post_id))

    all_comments = [dict(row) for row in cursor.fetchall()]
    conn.close()

    # Build nested hierarchy
    comment_map = {c['id']: {**c, 'replies': []} for c in all_comments}
    root_comments = []

    for comment in all_comments:
        c_id = comment['id']
        parent_id = comment['parent_id']
        if parent_id and parent_id in comment_map:
            comment_map[parent_id]['replies'].append(comment_map[c_id])
        else:
            root_comments.append(comment_map[c_id])

    return root_comments

def create_comment(post_id, author_id, content, parent_id=None):
    conn = get_db()
    cursor = conn.cursor()

    # If parent_id provided, verify it exists and belongs to the same post
    if parent_id:
        cursor.execute("SELECT id FROM comments WHERE id = ? AND post_id = ?", (parent_id, post_id))
        if not cursor.fetchone():
            conn.close()
            return None

    cursor.execute("""
        INSERT INTO comments (post_id, author_id, parent_id, content)
        VALUES (?, ?, ?, ?)
    """, (post_id, author_id, parent_id, content))

    comment_id = cursor.lastrowid
    conn.commit()

    # Fetch created comment details
    cursor.execute("""
        SELECT 
            c.id, c.post_id, c.author_id, c.parent_id, c.content, c.is_edited, c.created_at,
            u.username as author_username, u.full_name as author_name, u.avatar_url as author_avatar,
            0 as like_count, 0 as is_liked
        FROM comments c
        JOIN users u ON c.author_id = u.id
        WHERE c.id = ?
    """, (comment_id,))

    new_comment = dict(cursor.fetchone())
    new_comment['replies'] = []
    conn.close()

    return new_comment

def delete_comment(comment_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM comments WHERE id = ?", (comment_id,))
    conn.commit()
    conn.close()
    return True

def toggle_comment_like(comment_id, user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM comment_likes WHERE comment_id = ? AND user_id = ?", (comment_id, user_id))
    exists = cursor.fetchone()

    if exists:
        cursor.execute("DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?", (comment_id, user_id))
        liked = False
    else:
        cursor.execute("INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)", (comment_id, user_id))
        liked = True

    cursor.execute("SELECT COUNT(*) FROM comment_likes WHERE comment_id = ?", (comment_id,))
    total_likes = cursor.fetchone()[0]

    conn.commit()
    conn.close()
    return {'liked': liked, 'likes_count': total_likes}

# --- CATEGORIES & TAGS ---

def get_categories():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.*, COUNT(p.id) as post_count
        FROM categories c
        LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
        GROUP BY c.id
        ORDER BY c.name ASC
    """)
    categories = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return categories

def get_tags():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.*, COUNT(pt.post_id) as post_count
        FROM tags t
        LEFT JOIN post_tags pt ON t.id = pt.tag_id
        GROUP BY t.id
        HAVING post_count > 0
        ORDER BY post_count DESC, t.name ASC
    """)
    tags = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return tags

# --- USER PROFILE & STATS ---

def get_user_profile(user_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, username, email, full_name, bio, avatar_url, role, created_at
        FROM users WHERE id = ?
    """, (user_id,))
    user_row = cursor.fetchone()
    if not user_row:
        conn.close()
        return None

    user = dict(user_row)

    # Post stats
    cursor.execute("SELECT COUNT(*) FROM posts WHERE author_id = ?", (user_id,))
    user['total_posts'] = cursor.fetchone()[0]

    # Comment stats
    cursor.execute("SELECT COUNT(*) FROM comments WHERE author_id = ?", (user_id,))
    user['total_comments'] = cursor.fetchone()[0]

    # Received likes stats
    cursor.execute("""
        SELECT COUNT(*) FROM post_likes pl 
        JOIN posts p ON pl.post_id = p.id 
        WHERE p.author_id = ?
    """, (user_id,))
    user['total_likes_received'] = cursor.fetchone()[0]

    conn.close()
    return user

def update_user_profile(user_id, full_name, bio, avatar_url):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users SET full_name = ?, bio = ?, avatar_url = ?
        WHERE id = ?
    """, (full_name, bio, avatar_url, user_id))
    conn.commit()
    conn.close()
    return True

def get_dashboard_stats():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM posts WHERE status = 'published'")
    total_posts = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM comments")
    total_comments = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]

    cursor.execute("SELECT SUM(views_count) FROM posts")
    total_views = cursor.fetchone()[0] or 0

    cursor.execute("SELECT COUNT(*) FROM post_likes")
    total_likes = cursor.fetchone()[0] or 0

    conn.close()

    return {
        'total_posts': total_posts,
        'total_comments': total_comments,
        'total_users': total_users,
        'total_views': total_views,
        'total_likes': total_likes
    }
