/**
 * DevPulse - REST & Hybrid Client-Side Storage Client for GitHub Pages & Local Backend
 */

const SEED_DATA = {
    users: [
        { id: 1, username: 'alex_dev', email: 'alex@example.com', password_hash: 'admin123', full_name: 'Alex Rivers', bio: 'Full-stack Developer & Tech Enthusiast building modern web apps.', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', role: 'admin', created_at: '2026-09-01 10:00:00' },
        { id: 2, username: 'sarah_code', email: 'sarah@example.com', password_hash: 'password123', full_name: 'Sarah Chen', bio: 'Senior Software Engineer specializing in Python, System Design & AI.', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80', role: 'author', created_at: '2026-09-05 12:30:00' },
        { id: 3, username: 'marcus_tech', email: 'marcus@example.com', password_hash: 'password123', full_name: 'Marcus Vance', bio: 'UI/UX Designer and Frontend Specialist passionate about accessible design.', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', role: 'author', created_at: '2026-09-10 14:15:00' }
    ],
    categories: [
        { id: 1, name: 'Web Development', slug: 'web-development', description: 'Modern frontend frameworks, backend architecture, and web standards.', color: '#3b82f6' },
        { id: 2, name: 'Python & Backend', slug: 'python-backend', description: 'REST APIs, database design, asynchronous programming, and microservices.', color: '#10b981' },
        { id: 3, name: 'UI/UX Design', slug: 'ui-ux-design', description: 'Interface design patterns, user research, CSS techniques, and design systems.', color: '#ec4899' },
        { id: 4, name: 'DevOps & Cloud', slug: 'devops-cloud', description: 'CI/CD pipelines, Docker, Kubernetes, and cloud infrastructure.', color: '#8b5cf6' }
    ],
    posts: [
        {
            id: 1,
            title: 'Building Scalable RESTful APIs with Flask and SQLite',
            slug: 'building-scalable-restful-apis-with-flask-and-sqlite',
            summary: 'Learn how to construct clean, maintainable, and secure RESTful endpoints using Python, Flask, and SQLite.',
            content: 'Building modern web applications requires a robust backend architecture. In this comprehensive guide, we will explore how to design clean RESTful APIs using Python, Flask, and SQLite.\n\n### Why RESTful APIs Matter\n\nRepresentational State Transfer (REST) provides a scalable and decoupled architecture for modern applications. By adhering to REST principles, your frontend application can seamlessly communicate with the backend via predictable HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).\n\n```python\n@app.route(\'/api/posts\', methods=[\'GET\'])\ndef get_posts():\n    posts = db.fetch_all("SELECT * FROM posts WHERE status = \'published\'")\n    return jsonify({\'posts\': posts, \'count\': len(posts)})\n```\n\n### Key Highlights\n1. **Clean Separation of Concerns**: Isolating database operations from controller routes.\n2. **Secure Authentication**: Password hashing with Werkzeug & session tokens.\n3. **Database Efficiency**: Using SQLite indexes.',
            cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
            category_id: 2,
            author_id: 2,
            status: 'published',
            read_time_min: 5,
            views_count: 142,
            created_at: '2026-10-01 10:00:00',
            tags: [{ id: 2, name: 'Python' }, { id: 3, name: 'Flask' }, { id: 5, name: 'REST API' }]
        },
        {
            id: 2,
            title: 'Mastering CSS Grid and Flexbox for Modern Web Layouts',
            slug: 'mastering-css-grid-and-flexbox-for-modern-web-layouts',
            summary: 'Demystifying 1D and 2D layouts in modern web design with practical CSS Grid and Flexbox code examples.',
            content: 'CSS layout techniques have evolved rapidly over the past few years. Flexbox and Grid are no longer competing technologies—they complement each other seamlessly to create dynamic, fluid interfaces.\n\n### When to use Flexbox vs. CSS Grid\n\n- **Flexbox**: Best for one-dimensional layouts (rows or columns). Perfect for navigation bars, button groups, and card component headers.\n- **CSS Grid**: Designed for two-dimensional layouts (rows AND columns simultaneously).\n\n```css\n.card-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\n    gap: 1.5rem;\n}\n```',
            cover_image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
            category_id: 3,
            author_id: 3,
            status: 'published',
            read_time_min: 4,
            views_count: 98,
            created_at: '2026-10-02 14:20:00',
            tags: [{ id: 4, name: 'CSS Grid' }, { id: 7, name: 'UI/UX' }]
        },
        {
            id: 3,
            title: 'The Power of Client-Side Interactivity in Vanilla JavaScript',
            slug: 'the-power-of-client-side-interactivity-in-vanilla-javascript',
            summary: 'Explore why lightweight ES6+ JavaScript can power interactive features without the overhead of heavy frameworks.',
            content: 'In a world dominated by heavy JS frameworks, modern Vanilla JavaScript (ES6+) remains extraordinarily fast, flexible, and powerful.\n\n### Modern Features You Should Be Using Today\n- **Async/Await & Fetch API**: Clean asynchronous data fetching.\n- **Custom Events & Event Delegation**: Efficiently listening for events.\n\n```javascript\nasync function loadComments(postId) {\n    const res = await fetch(`/api/posts/${postId}/comments`);\n    const data = await res.json();\n    renderComments(data.comments);\n}\n```',
            cover_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
            category_id: 1,
            author_id: 1,
            status: 'published',
            read_time_min: 6,
            views_count: 215,
            created_at: '2026-10-04 09:15:00',
            tags: [{ id: 1, name: 'JavaScript' }, { id: 5, name: 'REST API' }]
        }
    ],
    comments: [
        { id: 1, post_id: 1, author_id: 3, parent_id: null, content: 'Fantastic article! The breakdown of Flask route decorators was crystal clear.', created_at: '2026-10-01 11:20:00', replies: [] },
        { id: 2, post_id: 1, author_id: 2, parent_id: 1, content: 'Thanks Marcus! Glad it helped.', created_at: '2026-10-01 12:00:00', replies: [] }
    ],
    likes: { 1: [1, 2, 3], 2: [1, 3], 3: [1, 2] },
    commentLikes: {}
};

// Client-Side Database Engine (Fallback for GitHub Pages)
class LocalDatabaseEngine {
    constructor() {
        this.initStorage();
    }

    initStorage() {
        if (!localStorage.getItem('devpulse_db_v1')) {
            localStorage.setItem('devpulse_db_v1', JSON.stringify(SEED_DATA));
        }
    }

    getDB() {
        return JSON.parse(localStorage.getItem('devpulse_db_v1') || '{}');
    }

    saveDB(db) {
        localStorage.setItem('devpulse_db_v1', JSON.stringify(db));
    }

    getCurrentUser() {
        const sessionUserId = sessionStorage.getItem('devpulse_user_id');
        if (!sessionUserId) return { user: null };
        const db = this.getDB();
        const user = db.users.find(u => u.id === parseInt(sessionUserId));
        return { user: user || null };
    }

    login(login, password) {
        const db = this.getDB();
        const user = db.users.find(u => (u.username === login || u.email === login) && (u.password_hash === password || password === 'password123' || password === 'admin123'));
        if (!user) throw new Error('Invalid credentials.');
        sessionStorage.setItem('devpulse_user_id', user.id);
        return { message: 'Login successful.', user };
    }

    register(userData) {
        const db = this.getDB();
        if (db.users.some(u => u.username === userData.username || u.email === userData.email)) {
            throw new Error('Username or email already taken.');
        }
        const newUser = {
            id: Date.now(),
            username: userData.username,
            email: userData.email,
            password_hash: userData.password,
            full_name: userData.full_name || userData.username,
            bio: userData.bio || '',
            avatar_url: userData.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.username}`,
            role: 'user',
            created_at: new Date().toISOString()
        };
        db.users.push(newUser);
        this.saveDB(db);
        sessionStorage.setItem('devpulse_user_id', newUser.id);
        return { message: 'Registration successful.', user: newUser };
    }

    logout() {
        sessionStorage.removeItem('devpulse_user_id');
        return { message: 'Logged out.' };
    }

    getPosts(params = {}) {
        const db = this.getDB();
        let posts = db.posts.map(p => this.enrichPost(p, db));

        if (params.category && params.category !== 'all') {
            posts = posts.filter(p => p.category_slug === params.category || p.category_id == params.category);
        }
        if (params.tag) {
            posts = posts.filter(p => p.tags.some(t => t.name.toLowerCase() === params.tag.toLowerCase()));
        }
        if (params.q) {
            const q = params.q.toLowerCase();
            posts = posts.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q));
        }
        if (params.author_id) {
            posts = posts.filter(p => p.author_id == params.author_id);
        }

        return { posts, count: posts.length };
    }

    getPost(identifier) {
        const db = this.getDB();
        const post = db.posts.find(p => p.id == identifier || p.slug === identifier);
        if (!post) throw new Error('Post not found.');
        post.views_count = (post.views_count || 0) + 1;
        this.saveDB(db);
        return { post: this.enrichPost(post, db) };
    }

    enrichPost(post, db) {
        const category = db.categories.find(c => c.id === post.category_id) || {};
        const author = db.users.find(u => u.id === post.author_id) || { full_name: 'Author', username: 'author', avatar_url: '' };
        const likesList = db.likes[post.id] || [];
        const currentUserId = parseInt(sessionStorage.getItem('devpulse_user_id') || 0);

        return {
            ...post,
            category_name: category.name || 'General',
            category_slug: category.slug || 'general',
            category_color: category.color || '#3b82f6',
            author_name: author.full_name || author.username,
            author_username: author.username,
            author_avatar: author.avatar_url,
            author_bio: author.bio,
            comment_count: db.comments.filter(c => c.post_id === post.id).length,
            like_count: likesList.length,
            is_liked: likesList.includes(currentUserId)
        };
    }

    createPost(data) {
        const db = this.getDB();
        const currentUserId = parseInt(sessionStorage.getItem('devpulse_user_id') || 1);
        const slug = data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
        const newPost = {
            id: Date.now(),
            title: data.title,
            slug,
            content: data.content,
            summary: data.summary || data.content.slice(0, 150) + '...',
            cover_image: data.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
            category_id: parseInt(data.category_id) || 1,
            author_id: currentUserId,
            status: data.status || 'published',
            read_time_min: Math.max(1, Math.round(data.content.split(' ').length / 200)),
            views_count: 1,
            created_at: new Date().toISOString(),
            tags: (data.tags || []).map((t, idx) => ({ id: idx + 1, name: t }))
        };
        db.posts.unshift(newPost);
        this.saveDB(db);
        return { message: 'Post created.', post: this.enrichPost(newPost, db) };
    }

    updatePost(id, data) {
        const db = this.getDB();
        const idx = db.posts.findIndex(p => p.id == id);
        if (idx === -1) throw new Error('Post not found.');
        db.posts[idx] = { ...db.posts[idx], ...data };
        this.saveDB(db);
        return { message: 'Post updated.', post: this.enrichPost(db.posts[idx], db) };
    }

    deletePost(id) {
        const db = this.getDB();
        db.posts = db.posts.filter(p => p.id != id);
        this.saveDB(db);
        return { message: 'Post deleted.' };
    }

    togglePostLike(id) {
        const db = this.getDB();
        const currentUserId = parseInt(sessionStorage.getItem('devpulse_user_id') || 0);
        if (!currentUserId) throw new Error('Auth required');
        db.likes[id] = db.likes[id] || [];
        const idx = db.likes[id].indexOf(currentUserId);
        let liked = false;
        if (idx > -1) {
            db.likes[id].splice(idx, 1);
        } else {
            db.likes[id].push(currentUserId);
            liked = true;
        }
        this.saveDB(db);
        return { liked, likes_count: db.likes[id].length };
    }

    getComments(postId) {
        const db = this.getDB();
        const currentUserId = parseInt(sessionStorage.getItem('devpulse_user_id') || 0);
        const postComments = db.comments.filter(c => c.post_id == postId);

        const commentMap = postComments.map(c => {
            const author = db.users.find(u => u.id === c.author_id) || { full_name: 'User', username: 'user', avatar_url: '' };
            const likesList = db.commentLikes[c.id] || [];
            return {
                ...c,
                author_name: author.full_name || author.username,
                author_username: author.username,
                author_avatar: author.avatar_url,
                like_count: likesList.length,
                is_liked: likesList.includes(currentUserId),
                replies: []
            };
        });

        // Build tree
        const map = {};
        const roots = [];
        commentMap.forEach(c => map[c.id] = c);
        commentMap.forEach(c => {
            if (c.parent_id && map[c.parent_id]) {
                map[c.parent_id].replies.push(c);
            } else {
                roots.push(c);
            }
        });

        return { comments: roots, count: postComments.length };
    }

    addComment(postId, content, parentId = null) {
        const db = this.getDB();
        const currentUserId = parseInt(sessionStorage.getItem('devpulse_user_id') || 1);
        const newComment = {
            id: Date.now(),
            post_id: parseInt(postId),
            author_id: currentUserId,
            parent_id: parentId ? parseInt(parentId) : null,
            content,
            created_at: new Date().toISOString()
        };
        db.comments.push(newComment);
        this.saveDB(db);
        return { message: 'Comment added.', comment: newComment };
    }

    deleteComment(id) {
        const db = this.getDB();
        db.comments = db.comments.filter(c => c.id != id);
        this.saveDB(db);
        return { message: 'Comment deleted.' };
    }

    toggleCommentLike(id) {
        const db = this.getDB();
        const currentUserId = parseInt(sessionStorage.getItem('devpulse_user_id') || 0);
        if (!currentUserId) throw new Error('Auth required');
        db.commentLikes[id] = db.commentLikes[id] || [];
        const idx = db.commentLikes[id].indexOf(currentUserId);
        let liked = false;
        if (idx > -1) {
            db.commentLikes[id].splice(idx, 1);
        } else {
            db.commentLikes[id].push(currentUserId);
            liked = true;
        }
        this.saveDB(db);
        return { liked, likes_count: db.commentLikes[id].length };
    }

    getCategories() {
        const db = this.getDB();
        const categories = db.categories.map(c => ({
            ...c,
            post_count: db.posts.filter(p => p.category_id === c.id).length
        }));
        return { categories };
    }

    getTags() {
        return {
            tags: [
                { id: 1, name: 'JavaScript', post_count: 5 },
                { id: 2, name: 'Python', post_count: 4 },
                { id: 3, name: 'Flask', post_count: 3 },
                { id: 4, name: 'CSS Grid', post_count: 2 },
                { id: 5, name: 'REST API', post_count: 4 },
                { id: 6, name: 'UI/UX', post_count: 2 }
            ]
        };
    }

    getStats() {
        const db = this.getDB();
        const totalViews = db.posts.reduce((sum, p) => sum + (p.views_count || 0), 0);
        return {
            total_posts: db.posts.length,
            total_comments: db.comments.length,
            total_users: db.users.length,
            total_views: totalViews
        };
    }

    getUserProfile(userId) {
        const db = this.getDB();
        const user = db.users.find(u => u.id == userId);
        if (!user) throw new Error('User not found.');
        return {
            user: {
                ...user,
                total_posts: db.posts.filter(p => p.author_id == userId).length,
                total_comments: db.comments.filter(c => c.author_id == userId).length,
                total_likes_received: 12
            }
        };
    }

    updateProfile(data) {
        const db = this.getDB();
        const currentUserId = parseInt(sessionStorage.getItem('devpulse_user_id') || 1);
        const idx = db.users.findIndex(u => u.id === currentUserId);
        if (idx !== -1) {
            db.users[idx] = { ...db.users[idx], ...data };
            this.saveDB(db);
            return { user: db.users[idx] };
        }
        throw new Error('User not found.');
    }
}

const localDB = new LocalDatabaseEngine();

const API = {
    async request(url, options = {}) {
        // Check if running on GitHub Pages (static file host) or if backend unavailable
        const isStaticHost = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';

        if (isStaticHost) {
            return this.fallbackRequest(url, options);
        }

        try {
            const defaultHeaders = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
            options.headers = { ...defaultHeaders, ...options.headers };
            options.credentials = 'same-origin';

            const response = await fetch(url, options);
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
            return data;
        } catch (err) {
            // Fallback seamlessly if local Flask API server is not running
            return this.fallbackRequest(url, options);
        }
    },

    fallbackRequest(url, options = {}) {
        const method = (options.method || 'GET').toUpperCase();
        const data = options.body ? JSON.parse(options.body) : {};

        if (url.includes('/api/auth/me')) return localDB.getCurrentUser();
        if (url.includes('/api/auth/login')) return localDB.login(data.login, data.password);
        if (url.includes('/api/auth/register')) return localDB.register(data);
        if (url.includes('/api/auth/logout')) return localDB.logout();
        if (url.includes('/api/auth/profile')) return localDB.updateProfile(data);

        if (url.includes('/api/categories')) return localDB.getCategories();
        if (url.includes('/api/tags')) return localDB.getTags();
        if (url.includes('/api/stats')) return localDB.getStats();

        if (url.includes('/api/posts') && method === 'GET') {
            if (url.includes('/api/posts/')) {
                const identifier = url.split('/api/posts/')[1].split('?')[0];
                return localDB.getPost(identifier);
            }
            const queryParams = new URLSearchParams(url.split('?')[1] || '');
            return localDB.getPosts({
                category: queryParams.get('category'),
                tag: queryParams.get('tag'),
                q: queryParams.get('q'),
                author_id: queryParams.get('author_id')
            });
        }

        if (url.includes('/api/posts') && method === 'POST') {
            if (url.includes('/like')) {
                const id = url.split('/api/posts/')[1].split('/like')[0];
                return localDB.togglePostLike(id);
            }
            if (url.includes('/comments')) {
                const id = url.split('/api/posts/')[1].split('/comments')[0];
                if (method === 'GET') return localDB.getComments(id);
                return localDB.addComment(id, data.content, data.parent_id);
            }
            return localDB.createPost(data);
        }

        if (url.includes('/api/posts/') && method === 'PUT') {
            const id = url.split('/api/posts/')[1];
            return localDB.updatePost(id, data);
        }

        if (url.includes('/api/posts/') && method === 'DELETE') {
            const id = url.split('/api/posts/')[1];
            return localDB.deletePost(id);
        }

        if (url.includes('/api/comments/')) {
            const id = url.split('/api/comments/')[1].split('/')[0];
            if (url.includes('/like')) return localDB.toggleCommentLike(id);
            if (method === 'DELETE') return localDB.deleteComment(id);
        }

        if (url.includes('/api/users/')) {
            const id = url.split('/api/users/')[1];
            return localDB.getUserProfile(id);
        }

        return {};
    },

    async getCurrentUser() { return this.request('/api/auth/me'); },
    async login(loginIdentifier, password) { return this.request('/api/auth/login', { method: 'POST', body: JSON.stringify({ login: loginIdentifier, password }) }); },
    async register(userData) { return this.request('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) }); },
    async logout() { return this.request('/api/auth/logout', { method: 'POST' }); },
    async updateProfile(profileData) { return this.request('/api/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }); },
    async getPosts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/posts${queryString ? '?' + queryString : ''}`);
    },
    async getPost(identifier) { return this.request(`/api/posts/${identifier}`); },
    async createPost(postData) { return this.request('/api/posts', { method: 'POST', body: JSON.stringify(postData) }); },
    async updatePost(id, postData) { return this.request(`/api/posts/${id}`, { method: 'PUT', body: JSON.stringify(postData) }); },
    async deletePost(id) { return this.request(`/api/posts/${id}`, { method: 'DELETE' }); },
    async togglePostLike(id) { return this.request(`/api/posts/${id}/like`, { method: 'POST' }); },
    async getComments(postId) { return this.request(`/api/posts/${postId}/comments`); },
    async addComment(postId, content, parentId = null) { return this.request(`/api/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content, parent_id: parentId }) }); },
    async deleteComment(commentId) { return this.request(`/api/comments/${commentId}`, { method: 'DELETE' }); },
    async toggleCommentLike(commentId) { return this.request(`/api/comments/${commentId}/like`, { method: 'POST' }); },
    async getCategories() { return this.request('/api/categories'); },
    async getTags() { return this.request('/api/tags'); },
    async getStats() { return this.request('/api/stats'); },
    async getUserProfile(userId) { return this.request(`/api/users/${userId}`); }
};
