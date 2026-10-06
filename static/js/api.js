/**
 * DevPulse REST API Client
 */
const API = {
    async request(url, options = {}) {
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        options.headers = {
            ...defaultHeaders,
            ...options.headers
        };

        options.credentials = 'same-origin';

        try {
            const response = await fetch(url, options);
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errorMsg = data.error || `Request failed with status ${response.status}`;
                throw new Error(errorMsg);
            }

            return data;
        } catch (err) {
            console.error(`API Error [${options.method || 'GET'} ${url}]:`, err);
            throw err;
        }
    },

    // Auth endpoints
    async getCurrentUser() {
        return this.request('/api/auth/me');
    },

    async login(loginIdentifier, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ login: loginIdentifier, password })
        });
    },

    async register(userData) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async logout() {
        return this.request('/api/auth/logout', { method: 'POST' });
    },

    async updateProfile(profileData) {
        return this.request('/api/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    // Posts endpoints
    async getPosts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `/api/posts${queryString ? '?' + queryString : ''}`;
        return this.request(url);
    },

    async getPost(identifier) {
        return this.request(`/api/posts/${identifier}`);
    },

    async createPost(postData) {
        return this.request('/api/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    },

    async updatePost(id, postData) {
        return this.request(`/api/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    },

    async deletePost(id) {
        return this.request(`/api/posts/${id}`, {
            method: 'DELETE'
        });
    },

    async togglePostLike(id) {
        return this.request(`/api/posts/${id}/like`, {
            method: 'POST'
        });
    },

    // Comments endpoints
    async getComments(postId) {
        return this.request(`/api/posts/${postId}/comments`);
    },

    async addComment(postId, content, parentId = null) {
        return this.request(`/api/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content, parent_id: parentId })
        });
    },

    async deleteComment(commentId) {
        return this.request(`/api/comments/${commentId}`, {
            method: 'DELETE'
        });
    },

    async toggleCommentLike(commentId) {
        return this.request(`/api/comments/${commentId}/like`, {
            method: 'POST'
        });
    },

    // Metadata & Stats
    async getCategories() {
        return this.request('/api/categories');
    },

    async getTags() {
        return this.request('/api/tags');
    },

    async getStats() {
        return this.request('/api/stats');
    },

    async getUserProfile(userId) {
        return this.request(`/api/users/${userId}`);
    }
};
