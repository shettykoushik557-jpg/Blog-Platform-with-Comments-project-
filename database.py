import sqlite3
import os
from datetime import datetime
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), 'blog.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Create Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        bio TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    ''')

    # Create Categories table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#3b82f6'
    );
    ''')

    # Create Posts table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        cover_image TEXT,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'published',
        read_time_min INTEGER DEFAULT 3,
        views_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    ''')

    # Create Tags table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    );
    ''')

    # Create Post Tags join table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS post_tags (
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
    );
    ''')

    # Create Comments table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_edited BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    ''')

    # Create Post Likes table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS post_likes (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id)
    );
    ''')

    # Create Comment Likes table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS comment_likes (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, comment_id)
    );
    ''')

    # Create Bookmarks table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS bookmarks (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id)
    );
    ''')

    conn.commit()
    conn.close()
    
    # Seed initial data if DB is empty
    seed_db()

def seed_db():
    conn = get_db()
    cursor = conn.cursor()

    # Check if users exist
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    # Seed Default Users
    admin_pw = generate_password_hash("admin123")
    user_pw = generate_password_hash("password123")

    users_data = [
        ("alex_dev", "alex@example.com", admin_pw, "Alex Rivers", "Full-stack Developer & Tech Enthusiast building modern web apps.", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80", "admin"),
        ("sarah_code", "sarah@example.com", user_pw, "Sarah Chen", "Senior Software Engineer specializing in Python, System Design & AI.", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80", "author"),
        ("marcus_tech", "marcus@example.com", user_pw, "Marcus Vance", "UI/UX Designer and Frontend Specialist passionate about accessible design.", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80", "author"),
        ("emily_writer", "emily@example.com", user_pw, "Emily Watson", "Technical Writer & Open Source advocate.", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=250&q=80", "user")
    ]

    cursor.executemany(
        "INSERT INTO users (username, email, password_hash, full_name, bio, avatar_url, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
        users_data
    )

    # Seed Categories
    categories_data = [
        ("Web Development", "web-development", "Modern frontend frameworks, backend architecture, and web standards.", "#3b82f6"),
        ("Python & Backend", "python-backend", "REST APIs, database design, asynchronous programming, and microservices.", "#10b981"),
        ("UI/UX Design", "ui-ux-design", "Interface design patterns, user research, CSS techniques, and design systems.", "#ec4899"),
        ("DevOps & Cloud", "devops-cloud", "CI/CD pipelines, Docker, Kubernetes, and cloud infrastructure.", "#8b5cf6")
    ]

    cursor.executemany(
        "INSERT INTO categories (name, slug, description, color) VALUES (?, ?, ?, ?)",
        categories_data
    )

    # Seed Posts
    posts_data = [
        (
            "Building Scalable RESTful APIs with Flask and SQLite",
            "building-scalable-restful-apis-with-flask-and-sqlite",
            """Building modern web applications requires a robust backend architecture. In this comprehensive guide, we will explore how to design clean RESTful APIs using Python, Flask, and SQLite.

### Why RESTful APIs Matter

Representational State Transfer (REST) provides a scalable and decoupled architecture for modern applications. By adhering to REST principles, your frontend application can seamlessly communicate with the backend via predictable HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).

```python
@app.route('/api/posts', methods=['GET'])
def get_posts():
    posts = db.fetch_all("SELECT * FROM posts WHERE status = 'published'")
    return jsonify({'posts': posts, 'count': len(posts)})
```

### Key Highlights
1. **Clean Separation of Concerns**: Isolating database operations from controller routes.
2. **Secure Authentication**: Implementing password hashing with Werkzeug and session/JWT tokens.
3. **Database Efficiency**: Using SQLite indexes and connection pooling logic.

Whether you're building a simple personal blog or an enterprise dashboard, starting with clear REST standards ensures your project scales gracefully!""",
            "Learn how to construct clean, maintainable, and secure RESTful endpoints using Python, Flask, and SQLite.",
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
            2, 2, "published", 5, 142
        ),
        (
            "Mastering CSS Grid and Flexbox for Modern Web Layouts",
            "mastering-css-grid-and-flexbox-for-modern-web-layouts",
            """CSS layout techniques have evolved rapidly over the past few years. Flexbox and Grid are no longer competing technologies—they complement each other seamlessly to create dynamic, fluid interfaces.

### When to use Flexbox vs. CSS Grid

- **Flexbox**: Best for one-dimensional layouts (rows or columns). Perfect for navigation bars, button groups, and card component headers.
- **CSS Grid**: Designed for two-dimensional layouts (rows AND columns simultaneously). Ideal for main page skeletons, photo galleries, and complex dashboard widgets.

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}
```

### Key Takeaways
Always start mobile-first, utilize CSS custom properties for theme variables, and embrace CSS Grid's `minmax()` function for effortless responsive design!""",
            "Demystifying 1D and 2D layouts in modern web design with practical CSS Grid and Flexbox code examples.",
            "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
            3, 3, "published", 4, 98
        ),
        (
            "The Power of Client-Side Interactivity in Vanilla JavaScript",
            "the-power-of-client-side-interactivity-in-vanilla-javascript",
            """In a world dominated by heavy JS frameworks, modern Vanilla JavaScript (ES6+) remains extraordinarily fast, flexible, and powerful.

### Modern Features You Should Be Using Today
- **Async/Await & Fetch API**: Clean asynchronous data fetching without external HTTP libraries.
- **Custom Events & Event Delegation**: Efficiently listening for events on dynamically rendered DOM trees.
- **DOM Mutations & Templates**: Leveraging standard `<template>` HTML tags for lightning-fast UI updates.

```javascript
async function loadComments(postId) {
    const res = await fetch(`/api/posts/${postId}/comments`);
    const data = await res.json();
    renderComments(data.comments);
}
```

Building applications with zero external framework dependencies sharpens your core web development skills and delivers lightning-fast page loads for users.""",
            "Explore why lightweight ES6+ JavaScript can power interactive features without the overhead of heavy frameworks.",
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
            1, 1, "published", 6, 215
        )
    ]

    cursor.executemany(
        """INSERT INTO posts 
        (title, slug, content, summary, cover_image, category_id, author_id, status, read_time_min, views_count) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        posts_data
    )

    # Seed Tags
    tags = ["JavaScript", "Python", "Flask", "CSS Grid", "REST API", "Database", "UI/UX"]
    for tag in tags:
        cursor.execute("INSERT INTO tags (name) VALUES (?)", (tag,))

    # Map Tags to Posts
    post_tags = [
        (1, 2), (1, 3), (1, 5), (1, 6), # Post 1: Python, Flask, REST API, Database
        (2, 4), (2, 7),                 # Post 2: CSS Grid, UI/UX
        (3, 1), (3, 5)                  # Post 3: JavaScript, REST API
    ]
    cursor.executemany("INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)", post_tags)

    # Seed Comments
    comments_data = [
        (1, 3, None, "Fantastic article, Sarah! The breakdown of Flask route decorators and SQLite parameters was crystal clear."),
        (1, 2, 1, "Thanks Marcus! Glad it helped. Let me know if you want a follow-up post on SQLAlchemy migration strategies!"),
        (1, 4, None, "Great read. How do you handle database connection pooling in high-traffic Flask deployments?"),
        (2, 1, None, " CSS Grid `minmax()` changed the way I build cards forever. No more fragile media queries for simple grids!"),
        (3, 2, None, "Vanilla JS is so underrated! The native Fetch API and template literals solve 90% of dynamic rendering needs.")
    ]

    cursor.executemany(
        "INSERT INTO comments (post_id, author_id, parent_id, content) VALUES (?, ?, ?, ?)",
        comments_data
    )

    # Seed Post Likes (post_id, user_id)
    likes_data = [
        (1, 1), (2, 1), (3, 1),
        (1, 2), (3, 2),
        (2, 3), (3, 3), (1, 4)
    ]
    cursor.executemany("INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)", likes_data)

    conn.commit()
    conn.close()
    print("Database successfully initialized and seeded.")

if __name__ == '__main__':
    init_db()
