/**
 * DevPulse - Main Single Page Application Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
    // --- STATE ---
    const state = {
        currentUser: null,
        currentView: 'feed',
        currentPost: null,
        activeCategory: 'all',
        activeTag: null,
        searchQuery: '',
        replyParentId: null,
        replyTargetUsername: ''
    };

    // --- DOM ELEMENTS ---
    const elements = {
        // Theme
        themeToggleBtn: document.getElementById('theme-toggle-btn'),
        themeIcon: document.getElementById('theme-icon'),

        // Nav & Auth
        logoBtn: document.getElementById('logo-btn'),
        searchInput: document.getElementById('search-input'),
        searchClearBtn: document.getElementById('search-clear-btn'),
        navAuthLoggedOut: document.getElementById('nav-auth-logged-out'),
        navAuthLoggedIn: document.getElementById('nav-auth-logged-in'),
        navAvatar: document.getElementById('nav-avatar'),
        userMenuBtn: document.getElementById('user-menu-btn'),
        userDropdown: document.getElementById('user-dropdown'),
        menuUserName: document.getElementById('menu-user-name'),
        menuUserUsername: document.getElementById('menu-user-username'),
        openLoginBtn: document.getElementById('open-login-btn'),
        openRegisterBtn: document.getElementById('open-register-btn'),
        createPostBtn: document.getElementById('create-post-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        menuProfileBtn: document.getElementById('menu-profile-btn'),
        menuMyPostsBtn: document.getElementById('menu-myposts-btn'),

        // Views
        viewFeed: document.getElementById('view-feed'),
        viewPost: document.getElementById('view-post'),
        viewEditor: document.getElementById('view-editor'),
        viewProfile: document.getElementById('view-profile'),

        // Feed Elements
        categoryPills: document.getElementById('category-pills'),
        postsContainer: document.getElementById('posts-container'),
        postsEmptyState: document.getElementById('posts-empty-state'),
        resetFeedBtn: document.getElementById('reset-feed-btn'),
        activeFilterIndicator: document.getElementById('active-filter-indicator'),
        filterText: document.getElementById('filter-text'),
        clearFilterBtn: document.getElementById('clear-filter-btn'),
        sidebarStats: document.getElementById('sidebar-stats'),
        sidebarTags: document.getElementById('sidebar-tags'),
        sidebarCtaBtn: document.getElementById('sidebar-cta-btn'),

        // Post Detail Elements
        postBackBtn: document.getElementById('post-back-btn'),
        postDetailContent: document.getElementById('post-detail-content'),
        commentsCount: document.getElementById('comments-count'),
        commentAuthNotice: document.getElementById('comment-auth-notice'),
        commentForm: document.getElementById('comment-form'),
        commentTextarea: document.getElementById('comment-textarea'),
        submitCommentBtn: document.getElementById('submit-comment-btn'),
        replyBanner: document.getElementById('reply-banner'),
        replyUserTarget: document.getElementById('reply-user-target'),
        cancelReplyBtn: document.getElementById('cancel-reply-btn'),
        commentsTree: document.getElementById('comments-tree'),
        commentLoginTrigger: document.getElementById('comment-login-trigger'),

        // Editor Elements
        editorTitle: document.getElementById('editor-title'),
        postForm: document.getElementById('post-form'),
        editorPostId: document.getElementById('editor-post-id'),
        editorPostTitle: document.getElementById('editor-post-title'),
        editorCategory: document.getElementById('editor-category'),
        editorTags: document.getElementById('editor-tags'),
        editorCover: document.getElementById('editor-cover'),
        editorSummary: document.getElementById('editor-summary'),
        editorContent: document.getElementById('editor-content'),
        tabWriteBtn: document.getElementById('tab-write-btn'),
        tabPreviewBtn: document.getElementById('tab-preview-btn'),
        editorWritePane: document.getElementById('editor-write-pane'),
        editorPreviewPane: document.getElementById('editor-preview-pane'),
        editorCancelBtn: document.getElementById('editor-cancel-btn'),

        // Profile Elements
        profileAvatar: document.getElementById('profile-avatar'),
        profileName: document.getElementById('profile-name'),
        profileUsername: document.getElementById('profile-username'),
        profileRole: document.getElementById('profile-role'),
        profileBio: document.getElementById('profile-bio'),
        profileJoined: document.getElementById('profile-joined'),
        pStatPosts: document.getElementById('p-stat-posts'),
        pStatComments: document.getElementById('p-stat-comments'),
        pStatLikes: document.getElementById('p-stat-likes'),
        userPostsContainer: document.getElementById('user-posts-container'),
        editProfileOpenBtn: document.getElementById('edit-profile-open-btn'),

        // Modals & Forms
        authModal: document.getElementById('auth-modal'),
        authModalClose: document.getElementById('auth-modal-close'),
        tabLoginBtn: document.getElementById('tab-login-btn'),
        tabRegisterBtn: document.getElementById('tab-register-btn'),
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        loginError: document.getElementById('login-error'),
        registerError: document.getElementById('register-error'),
        editProfileModal: document.getElementById('edit-profile-modal'),
        editProfileClose: document.getElementById('edit-profile-close'),
        editProfileForm: document.getElementById('edit-profile-form'),
        epFullname: document.getElementById('ep-fullname'),
        epBio: document.getElementById('ep-bio'),
        epAvatar: document.getElementById('ep-avatar'),

        // Toast Container
        toastContainer: document.getElementById('toast-container')
    };

    // Configure Marked JS
    marked.setOptions({
        breaks: true,
        gfm: true
    });

    // --- INITIALIZATION ---
    await initApp();

    async function initApp() {
        initTheme();
        bindEvents();
        await checkAuthStatus();
        await loadSidebarData();
        await handleRouting();
    }

    // --- THEME MANAGEMENT ---
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            elements.themeIcon.className = 'fa-solid fa-sun';
        } else {
            elements.themeIcon.className = 'fa-solid fa-moon';
        }
    }

    // --- ROUTING & VIEW SWITCHING ---
    function showView(viewName) {
        state.currentView = viewName;
        [elements.viewFeed, elements.viewPost, elements.viewEditor, elements.viewProfile].forEach(v => {
            v.classList.add('hidden');
            v.classList.remove('active');
        });

        const activeView = {
            'feed': elements.viewFeed,
            'post': elements.viewPost,
            'editor': elements.viewEditor,
            'profile': elements.viewProfile
        }[viewName] || elements.viewFeed;

        activeView.classList.remove('hidden');
        activeView.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleRouting() {
        const hash = window.location.hash.slice(1);
        if (hash.startsWith('post/')) {
            const identifier = hash.replace('post/', '');
            await openPostDetail(identifier);
        } else if (hash.startsWith('profile/')) {
            const userId = hash.replace('profile/', '');
            await openUserProfile(userId);
        } else if (hash === 'new-post') {
            openPostEditor();
        } else {
            showView('feed');
            await loadFeedPosts();
        }
    }

    // --- AUTH MANAGEMENT ---
    async function checkAuthStatus() {
        try {
            const data = await API.getCurrentUser();
            if (data.user) {
                state.currentUser = data.user;
                updateAuthUI();
            } else {
                state.currentUser = null;
                updateAuthUI();
            }
        } catch (err) {
            state.currentUser = null;
            updateAuthUI();
        }
    }

    function updateAuthUI() {
        if (state.currentUser) {
            elements.navAuthLoggedOut.classList.add('hidden');
            elements.navAuthLoggedIn.classList.remove('hidden');
            elements.navAvatar.src = state.currentUser.avatar_url;
            elements.menuUserName.textContent = state.currentUser.full_name || state.currentUser.username;
            elements.menuUserUsername.textContent = `@${state.currentUser.username}`;
            elements.commentAuthNotice.classList.add('hidden');
            elements.commentForm.classList.remove('hidden');
        } else {
            elements.navAuthLoggedOut.classList.remove('hidden');
            elements.navAuthLoggedIn.classList.add('hidden');
            elements.commentAuthNotice.classList.remove('hidden');
            elements.commentForm.classList.add('hidden');
        }
    }

    // --- FEED VIEW LOGIC ---
    async function loadSidebarData() {
        try {
            // Load Categories
            const catRes = await API.getCategories();
            renderCategories(catRes.categories || []);

            // Populate Editor Category Dropdown
            elements.editorCategory.innerHTML = (catRes.categories || []).map(c => 
                `<option value="${c.id}">${c.name}</option>`
            ).join('');

            // Load Tags
            const tagRes = await API.getTags();
            renderSidebarTags(tagRes.tags || []);

            // Load Platform Stats
            const statsRes = await API.getStats();
            document.getElementById('stat-posts').textContent = statsRes.total_posts || 0;
            document.getElementById('stat-comments').textContent = statsRes.total_comments || 0;
            document.getElementById('stat-users').textContent = statsRes.total_users || 0;
            document.getElementById('stat-views').textContent = statsRes.total_views || 0;
        } catch (err) {
            console.error("Failed to load sidebar metadata", err);
        }
    }

    function renderCategories(categories) {
        let html = `<button class="pill-btn ${state.activeCategory === 'all' ? 'active' : ''}" data-category="all">All Topics</button>`;
        html += categories.map(cat => `
            <button class="pill-btn ${state.activeCategory === cat.slug ? 'active' : ''}" data-category="${cat.slug}">
                ${cat.name} (${cat.post_count})
            </button>
        `).join('');
        elements.categoryPills.innerHTML = html;
    }

    function renderSidebarTags(tags) {
        elements.sidebarTags.innerHTML = tags.map(tag => `
            <span class="tag-badge" data-tag="${tag.name}">#${tag.name} (${tag.post_count})</span>
        `).join('');
    }

    async function loadFeedPosts() {
        elements.postsContainer.innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-notch fa-spin"></i><p>Loading articles...</p></div>';
        elements.postsEmptyState.classList.add('hidden');

        const params = {};
        if (state.activeCategory !== 'all') params.category = state.activeCategory;
        if (state.activeTag) params.tag = state.activeTag;
        if (state.searchQuery) params.q = state.searchQuery;

        // Update active filter pill/indicator
        updateFilterIndicator();

        try {
            const data = await API.getPosts(params);
            if (!data.posts || data.posts.length === 0) {
                elements.postsContainer.innerHTML = '';
                elements.postsEmptyState.classList.remove('hidden');
                return;
            }

            elements.postsContainer.innerHTML = data.posts.map(post => createPostCardHTML(post)).join('');
        } catch (err) {
            elements.postsContainer.innerHTML = `<div class="empty-state danger"><p>Error loading posts: ${err.message}</p></div>`;
        }
    }

    function updateFilterIndicator() {
        const filters = [];
        if (state.activeCategory !== 'all') filters.push(`Category: ${state.activeCategory}`);
        if (state.activeTag) filters.push(`Tag: #${state.activeTag}`);
        if (state.searchQuery) filters.push(`Search: "${state.searchQuery}"`);

        if (filters.length > 0) {
            elements.filterText.textContent = `Filtered by: ${filters.join(' | ')}`;
            elements.activeFilterIndicator.classList.remove('hidden');
        } else {
            elements.activeFilterIndicator.classList.add('hidden');
        }
    }

    function createPostCardHTML(post) {
        const formattedDate = formatDate(post.created_at);
        const tagsHTML = (post.tags || []).map(t => `<span class="tag-badge" data-tag="${t.name}">#${t.name}</span>`).join('');
        const categoryColor = post.category_color || '#2563eb';

        return `
            <article class="post-card" data-id="${post.id}" data-slug="${post.slug}">
                <div class="post-card-body">
                    <div class="post-card-meta">
                        <span class="category-badge" style="background-color: ${categoryColor}">${escapeHTML(post.category_name || 'General')}</span>
                        <span class="read-time"><i class="fa-regular fa-clock"></i> ${post.read_time_min} min read</span>
                    </div>

                    <h2 class="post-card-title">${escapeHTML(post.title)}</h2>
                    <p class="post-card-summary">${escapeHTML(post.summary || '')}</p>

                    <div class="post-card-tags">${tagsHTML}</div>

                    <div class="post-card-footer">
                        <div class="author-info" data-author-id="${post.author_id}">
                            <img class="author-avatar" src="${post.author_avatar}" alt="${escapeHTML(post.author_name)}">
                            <div class="author-details">
                                <span class="author-name">${escapeHTML(post.author_name)}</span>
                                <span class="post-date">${formattedDate}</span>
                            </div>
                        </div>

                        <div class="post-stats-actions">
                            <button class="stat-btn ${post.is_liked ? 'liked' : ''}" data-action="like-post" data-id="${post.id}">
                                <i class="${post.is_liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                                <span class="like-count">${post.like_count}</span>
                            </button>
                            <span class="stat-btn">
                                <i class="fa-regular fa-comment"></i> ${post.comment_count}
                            </span>
                            <span class="stat-btn">
                                <i class="fa-regular fa-eye"></i> ${post.views_count}
                            </span>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    // --- POST DETAIL VIEW LOGIC ---
    async function openPostDetail(identifier) {
        showView('post');
        elements.postDetailContent.innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-notch fa-spin"></i><p>Loading article...</p></div>';
        elements.commentsTree.innerHTML = '';

        try {
            const res = await API.getPost(identifier);
            const post = res.post;
            state.currentPost = post;
            window.location.hash = `post/${post.slug}`;

            renderPostDetail(post);
            await loadPostComments(post.id);
        } catch (err) {
            elements.postDetailContent.innerHTML = `<div class="empty-state danger"><h3>Article Not Found</h3><p>${err.message}</p></div>`;
        }
    }

    function renderPostDetail(post) {
        const formattedDate = formatDate(post.created_at);
        const parsedContent = DOMPurify.sanitize(marked.parse(post.content || ''));
        const tagsHTML = (post.tags || []).map(t => `<span class="tag-badge" data-tag="${t.name}">#${t.name}</span>`).join('');
        const categoryColor = post.category_color || '#2563eb';

        const isOwnerOrAdmin = state.currentUser && (state.currentUser.id === post.author_id || state.currentUser.role === 'admin');

        elements.postDetailContent.innerHTML = `
            ${post.cover_image ? `<img src="${post.cover_image}" class="post-cover-img" alt="${escapeHTML(post.title)}">` : ''}

            <div class="post-header">
                <div class="post-card-meta">
                    <span class="category-badge" style="background-color: ${categoryColor}">${escapeHTML(post.category_name || 'General')}</span>
                    <span class="read-time"><i class="fa-regular fa-clock"></i> ${post.read_time_min} min read &bull; ${post.views_count} views</span>
                </div>
                <h1 class="post-full-title">${escapeHTML(post.title)}</h1>
            </div>

            <div class="author-banner">
                <div class="author-info" data-author-id="${post.author_id}">
                    <img class="author-avatar" src="${post.author_avatar}" alt="${escapeHTML(post.author_name)}">
                    <div class="author-details">
                        <span class="author-name">${escapeHTML(post.author_name)}</span>
                        <span class="post-date">Published on ${formattedDate}</span>
                    </div>
                </div>

                ${isOwnerOrAdmin ? `
                    <div class="post-actions-group">
                        <button class="btn btn-outline btn-sm" id="detail-edit-btn" data-id="${post.id}"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="btn btn-outline btn-sm danger" id="detail-delete-btn" data-id="${post.id}"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>
                ` : ''}
            </div>

            <div class="post-content-body markdown-body">${parsedContent}</div>

            <div class="post-card-tags" style="margin-bottom: 2rem;">${tagsHTML}</div>

            <div class="post-action-bar">
                <button class="btn btn-outline ${post.is_liked ? 'liked' : ''}" id="detail-like-btn" data-id="${post.id}">
                    <i class="${post.is_liked ? 'fa-solid' : 'fa-regular'} fa-heart" style="color: ${post.is_liked ? 'var(--danger)' : 'inherit'}"></i>
                    <span>${post.is_liked ? 'Liked' : 'Like Post'}</span> (${post.like_count})
                </button>
                
                <button class="btn btn-outline" id="detail-share-btn">
                    <i class="fa-solid fa-share-nodes"></i> Share Article
                </button>
            </div>
        `;

        // Bind Edit/Delete detail buttons
        if (isOwnerOrAdmin) {
            document.getElementById('detail-edit-btn').addEventListener('click', () => editPost(post));
            document.getElementById('detail-delete-btn').addEventListener('click', () => confirmDeletePost(post.id));
        }

        document.getElementById('detail-like-btn').addEventListener('click', () => handleDetailLike(post.id));
        document.getElementById('detail-share-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href);
            showToast('Article link copied to clipboard!', 'success');
        });
    }

    // --- COMMENTS SYSTEM LOGIC ---
    async function loadPostComments(postId) {
        try {
            const data = await API.getComments(postId);
            elements.commentsCount.textContent = data.count || 0;
            renderCommentsTree(data.comments || []);
        } catch (err) {
            elements.commentsTree.innerHTML = `<p class="empty-state">Error loading comments: ${err.message}</p>`;
        }
    }

    function renderCommentsTree(comments) {
        if (!comments || comments.length === 0) {
            elements.commentsTree.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-comments empty-icon"></i>
                    <p>No comments yet. Be the first to start the conversation!</p>
                </div>
            `;
            return;
        }

        elements.commentsTree.innerHTML = comments.map(c => createCommentItemHTML(c)).join('');
    }

    function createCommentItemHTML(comment) {
        const formattedDate = formatDate(comment.created_at);
        const isOwnerOrAdmin = state.currentUser && (state.currentUser.id === comment.author_id || state.currentUser.role === 'admin');

        const repliesHTML = (comment.replies && comment.replies.length > 0) ? `
            <div class="comment-replies-tree">
                ${comment.replies.map(r => createCommentItemHTML(r)).join('')}
            </div>
        ` : '';

        return `
            <div class="comment-item" id="comment-${comment.id}">
                <div class="comment-avatar">
                    <img src="${comment.author_avatar}" alt="${escapeHTML(comment.author_name)}">
                </div>
                <div class="comment-content-box">
                    <div class="comment-header">
                        <span class="comment-author-name">${escapeHTML(comment.author_name)} <span style="font-weight:400; color:var(--text-muted)">@${escapeHTML(comment.author_username)}</span></span>
                        <span class="comment-date">${formattedDate}</span>
                    </div>

                    <div class="comment-text">${escapeHTML(comment.content)}</div>

                    <div class="comment-actions">
                        <button class="comment-action-btn ${comment.is_liked ? 'liked' : ''}" data-action="like-comment" data-id="${comment.id}">
                            <i class="${comment.is_liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i> ${comment.like_count}
                        </button>
                        ${state.currentUser ? `
                            <button class="comment-action-btn" data-action="reply-comment" data-id="${comment.id}" data-user="${escapeHTML(comment.author_username)}">
                                <i class="fa-solid fa-reply"></i> Reply
                            </button>
                        ` : ''}
                        ${isOwnerOrAdmin ? `
                            <button class="comment-action-btn danger" data-action="delete-comment" data-id="${comment.id}">
                                <i class="fa-solid fa-trash"></i> Delete
                            </button>
                        ` : ''}
                    </div>

                    ${repliesHTML}
                </div>
            </div>
        `;
    }

    // --- EDITOR VIEW LOGIC ---
    function openPostEditor(postToEdit = null) {
        if (!state.currentUser) {
            openAuthModal('login');
            showToast('Please log in to write articles.', 'info');
            return;
        }

        showView('editor');
        if (postToEdit) {
            elements.editorTitle.textContent = 'Edit Article';
            elements.editorPostId.value = postToEdit.id;
            elements.editorPostTitle.value = postToEdit.title;
            elements.editorCategory.value = postToEdit.category_id;
            elements.editorTags.value = (postToEdit.tags || []).map(t => t.name).join(', ');
            elements.editorCover.value = postToEdit.cover_image || '';
            elements.editorSummary.value = postToEdit.summary || '';
            elements.editorContent.value = postToEdit.content || '';
        } else {
            elements.editorTitle.textContent = 'Create New Article';
            elements.editorPostId.value = '';
            elements.postForm.reset();
        }
    }

    function editPost(post) {
        openPostEditor(post);
    }

    async function confirmDeletePost(postId) {
        if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
            try {
                await API.deletePost(postId);
                showToast('Article deleted successfully.', 'success');
                window.location.hash = '';
                showView('feed');
                await loadFeedPosts();
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    }

    // --- USER PROFILE VIEW LOGIC ---
    async function openUserProfile(userId) {
        showView('profile');
        try {
            const data = await API.getUserProfile(userId);
            const user = data.user;

            elements.profileAvatar.src = user.avatar_url;
            elements.profileName.textContent = user.full_name || user.username;
            elements.profileUsername.textContent = `@${user.username}`;
            elements.profileRole.textContent = user.role;
            elements.profileBio.textContent = user.bio || 'No bio provided yet.';
            elements.profileJoined.textContent = formatDate(user.created_at);

            elements.pStatPosts.textContent = user.total_posts || 0;
            elements.pStatComments.textContent = user.total_comments || 0;
            elements.pStatLikes.textContent = user.total_likes_received || 0;

            if (state.currentUser && state.currentUser.id === user.id) {
                elements.editProfileOpenBtn.classList.remove('hidden');
            } else {
                elements.editProfileOpenBtn.classList.add('hidden');
            }

            // Load user posts
            const postsRes = await API.getPosts({ author_id: user.id, status: 'all' });
            if (postsRes.posts && postsRes.posts.length > 0) {
                elements.userPostsContainer.innerHTML = postsRes.posts.map(p => createPostCardHTML(p)).join('');
            } else {
                elements.userPostsContainer.innerHTML = '<div class="empty-state"><p>This user has not published any articles yet.</p></div>';
            }
        } catch (err) {
            elements.userPostsContainer.innerHTML = `<div class="empty-state danger"><p>Error loading user profile: ${err.message}</p></div>`;
        }
    }

    // --- EVENT BINDINGS ---
    function bindEvents() {
        // Theme toggle
        elements.themeToggleBtn.addEventListener('click', toggleTheme);

        // Logo
        elements.logoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            state.activeCategory = 'all';
            state.activeTag = null;
            state.searchQuery = '';
            elements.searchInput.value = '';
            elements.searchClearBtn.classList.add('hidden');
            window.location.hash = '';
            showView('feed');
            loadFeedPosts();
        });

        // Search Input
        let searchTimeout;
        elements.searchInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            state.searchQuery = val;
            if (val) {
                elements.searchClearBtn.classList.remove('hidden');
            } else {
                elements.searchClearBtn.classList.add('hidden');
            }

            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (state.currentView !== 'feed') showView('feed');
                loadFeedPosts();
            }, 300);
        });

        elements.searchClearBtn.addEventListener('click', () => {
            elements.searchInput.value = '';
            state.searchQuery = '';
            elements.searchClearBtn.classList.add('hidden');
            loadFeedPosts();
        });

        // Category Pills Click
        elements.categoryPills.addEventListener('click', (e) => {
            const btn = e.target.closest('.pill-btn');
            if (btn) {
                const category = btn.dataset.category;
                state.activeCategory = category;
                document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadFeedPosts();
            }
        });

        // Clear Filter
        elements.clearFilterBtn.addEventListener('click', () => {
            state.activeCategory = 'all';
            state.activeTag = null;
            state.searchQuery = '';
            elements.searchInput.value = '';
            elements.searchClearBtn.classList.add('hidden');
            loadSidebarData();
            loadFeedPosts();
        });

        elements.resetFeedBtn.addEventListener('click', () => {
            state.activeCategory = 'all';
            state.activeTag = null;
            state.searchQuery = '';
            elements.searchInput.value = '';
            loadFeedPosts();
        });

        // Sidebar Tags Click
        elements.sidebarTags.addEventListener('click', (e) => {
            const badge = e.target.closest('.tag-badge');
            if (badge) {
                state.activeTag = badge.dataset.tag;
                if (state.currentView !== 'feed') showView('feed');
                loadFeedPosts();
            }
        });

        elements.sidebarCtaBtn.addEventListener('click', () => openPostEditor());

        // Delegation for Post Feed Cards Click (Title, Likes, Tag, Author)
        elements.postsContainer.addEventListener('click', async (e) => {
            const card = e.target.closest('.post-card');
            const likeBtn = e.target.closest('[data-action="like-post"]');
            const authorClick = e.target.closest('.author-info');
            const tagClick = e.target.closest('.tag-badge');

            if (likeBtn) {
                e.stopPropagation();
                if (!state.currentUser) {
                    openAuthModal('login');
                    return;
                }
                const postId = likeBtn.dataset.id;
                try {
                    const res = await API.togglePostLike(postId);
                    likeBtn.classList.toggle('liked', res.liked);
                    likeBtn.querySelector('i').className = `${res.liked ? 'fa-solid' : 'fa-regular'} fa-heart`;
                    likeBtn.querySelector('.like-count').textContent = res.likes_count;
                } catch (err) {
                    showToast(err.message, 'error');
                }
                return;
            }

            if (tagClick) {
                e.stopPropagation();
                state.activeTag = tagClick.dataset.tag;
                loadFeedPosts();
                return;
            }

            if (authorClick) {
                e.stopPropagation();
                const authorId = authorClick.dataset.authorId;
                openUserProfile(authorId);
                return;
            }

            if (card) {
                const slug = card.dataset.slug;
                openPostDetail(slug);
            }
        });

        // User Posts List Click (Profile view)
        elements.userPostsContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.post-card');
            if (card) {
                openPostDetail(card.dataset.slug);
            }
        });

        // Post Reader Back Button
        elements.postBackBtn.addEventListener('click', () => {
            window.location.hash = '';
            showView('feed');
        });

        // Comment Submission
        elements.commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!state.currentUser) {
                openAuthModal('login');
                return;
            }

            const content = elements.commentTextarea.value.trim();
            if (!content) return;

            try {
                await API.addComment(state.currentPost.id, content, state.replyParentId);
                elements.commentTextarea.value = '';
                cancelReply();
                showToast('Comment posted successfully!', 'success');
                await loadPostComments(state.currentPost.id);
            } catch (err) {
                showToast(err.message, 'error');
            }
        });

        // Comment Reply / Delete / Like Delegation
        elements.commentsTree.addEventListener('click', async (e) => {
            const replyBtn = e.target.closest('[data-action="reply-comment"]');
            const deleteBtn = e.target.closest('[data-action="delete-comment"]');
            const likeBtn = e.target.closest('[data-action="like-comment"]');

            if (replyBtn) {
                state.replyParentId = replyBtn.dataset.id;
                state.replyTargetUsername = replyBtn.dataset.user;
                elements.replyUserTarget.textContent = `@${state.replyTargetUsername}`;
                elements.replyBanner.classList.remove('hidden');
                elements.commentTextarea.focus();
            }

            if (deleteBtn) {
                const commentId = deleteBtn.dataset.id;
                if (confirm('Delete this comment?')) {
                    try {
                        await API.deleteComment(commentId);
                        showToast('Comment deleted.', 'success');
                        await loadPostComments(state.currentPost.id);
                    } catch (err) {
                        showToast(err.message, 'error');
                    }
                }
            }

            if (likeBtn) {
                if (!state.currentUser) {
                    openAuthModal('login');
                    return;
                }
                const commentId = likeBtn.dataset.id;
                try {
                    const res = await API.toggleCommentLike(commentId);
                    await loadPostComments(state.currentPost.id);
                } catch (err) {
                    showToast(err.message, 'error');
                }
            }
        });

        elements.cancelReplyBtn.addEventListener('click', cancelReply);
        elements.commentLoginTrigger.addEventListener('click', () => openAuthModal('login'));

        function cancelReply() {
            state.replyParentId = null;
            state.replyTargetUsername = '';
            elements.replyBanner.classList.add('hidden');
        }

        // Detail View Like button handler
        async function handleDetailLike(postId) {
            if (!state.currentUser) {
                openAuthModal('login');
                return;
            }
            try {
                const res = await API.togglePostLike(postId);
                state.currentPost.is_liked = res.liked;
                state.currentPost.like_count = res.likes_count;
                renderPostDetail(state.currentPost);
            } catch (err) {
                showToast(err.message, 'error');
            }
        }

        // Editor Tabs
        elements.tabWriteBtn.addEventListener('click', () => {
            elements.tabWriteBtn.classList.add('active');
            elements.tabPreviewBtn.classList.remove('active');
            elements.editorWritePane.classList.remove('hidden');
            elements.editorPreviewPane.classList.add('hidden');
        });

        elements.tabPreviewBtn.addEventListener('click', () => {
            elements.tabPreviewBtn.classList.add('active');
            elements.tabWriteBtn.classList.remove('active');
            elements.editorWritePane.classList.add('hidden');
            elements.editorPreviewPane.classList.remove('hidden');

            const content = elements.editorContent.value;
            elements.editorPreviewPane.innerHTML = DOMPurify.sanitize(marked.parse(content || '*Nothing to preview*'));
        });

        elements.editorCancelBtn.addEventListener('click', () => showView('feed'));

        // Post Form Submission
        elements.postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const postId = elements.editorPostId.value;
            const title = elements.editorPostTitle.value.trim();
            const category_id = parseInt(elements.editorCategory.value);
            const tags = elements.editorTags.value.split(',').map(t => t.trim()).filter(Boolean);
            const cover_image = elements.editorCover.value.trim();
            const summary = elements.editorSummary.value.trim();
            const content = elements.editorContent.value.trim();
            const status = elements.postForm.querySelector('input[name="post_status"]:checked').value;

            const postData = { title, category_id, tags, cover_image, summary, content, status };

            try {
                if (postId) {
                    await API.updatePost(postId, postData);
                    showToast('Article updated successfully!', 'success');
                } else {
                    const res = await API.createPost(postData);
                    showToast('Article published successfully!', 'success');
                }
                showView('feed');
                await loadSidebarData();
                await loadFeedPosts();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });

        // User Menu Dropdown Toggle
        elements.userMenuBtn.addEventListener('click', () => {
            elements.userDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!elements.navAuthLoggedIn.contains(e.target)) {
                elements.userDropdown.classList.add('hidden');
            }
        });

        elements.createPostBtn.addEventListener('click', () => openPostEditor());
        elements.menuProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            elements.userDropdown.classList.add('hidden');
            openUserProfile(state.currentUser.id);
        });
        elements.menuMyPostsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            elements.userDropdown.classList.add('hidden');
            openUserProfile(state.currentUser.id);
        });

        elements.logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await API.logout();
            state.currentUser = null;
            updateAuthUI();
            showToast('Logged out successfully.', 'info');
            showView('feed');
            await loadFeedPosts();
        });

        // AUTH MODAL LISTENERS
        elements.openLoginBtn.addEventListener('click', () => openAuthModal('login'));
        elements.openRegisterBtn.addEventListener('click', () => openAuthModal('register'));
        elements.authModalClose.addEventListener('click', closeAuthModal);

        elements.tabLoginBtn.addEventListener('click', () => switchAuthTab('login'));
        elements.tabRegisterBtn.addEventListener('click', () => switchAuthTab('register'));

        // Login Submit
        elements.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            elements.loginError.classList.add('hidden');
            const login = document.getElementById('login-identifier').value.trim();
            const pass = document.getElementById('login-password').value.trim();

            try {
                const res = await API.login(login, pass);
                state.currentUser = res.user;
                updateAuthUI();
                closeAuthModal();
                showToast(`Welcome back, ${res.user.full_name || res.user.username}!`, 'success');
                if (state.currentView === 'feed') await loadFeedPosts();
            } catch (err) {
                elements.loginError.textContent = err.message;
                elements.loginError.classList.remove('hidden');
            }
        });

        // Register Submit
        elements.registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            elements.registerError.classList.add('hidden');

            const userData = {
                username: document.getElementById('reg-username').value.trim(),
                email: document.getElementById('reg-email').value.trim(),
                password: document.getElementById('reg-password').value.trim(),
                full_name: document.getElementById('reg-fullname').value.trim(),
                bio: document.getElementById('reg-bio').value.trim()
            };

            try {
                const res = await API.register(userData);
                state.currentUser = res.user;
                updateAuthUI();
                closeAuthModal();
                showToast('Registration successful! Welcome to DevPulse.', 'success');
                if (state.currentView === 'feed') await loadFeedPosts();
            } catch (err) {
                elements.registerError.textContent = err.message;
                elements.registerError.classList.remove('hidden');
            }
        });

        // Demo Login Buttons
        document.querySelectorAll('.demo-login-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('login-identifier').value = btn.dataset.user;
                document.getElementById('login-password').value = btn.dataset.pass;
                elements.loginForm.dispatchEvent(new Event('submit'));
            });
        });

        // Profile Edit Modal
        elements.editProfileOpenBtn.addEventListener('click', () => {
            elements.epFullname.value = state.currentUser.full_name || '';
            elements.epBio.value = state.currentUser.bio || '';
            elements.epAvatar.value = state.currentUser.avatar_url || '';
            elements.editProfileModal.classList.remove('hidden');
        });

        elements.editProfileClose.addEventListener('click', () => elements.editProfileModal.classList.add('hidden'));

        elements.editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const updated = await API.updateProfile({
                    full_name: elements.epFullname.value.trim(),
                    bio: elements.epBio.value.trim(),
                    avatar_url: elements.epAvatar.value.trim()
                });
                state.currentUser = updated.user;
                updateAuthUI();
                elements.editProfileModal.classList.add('hidden');
                showToast('Profile updated!', 'success');
                openUserProfile(state.currentUser.id);
            } catch (err) {
                showToast(err.message, 'error');
            }
        });

        // Handle Hash Changes
        window.addEventListener('hashchange', handleRouting);
    }

    function openAuthModal(mode = 'login') {
        elements.authModal.classList.remove('hidden');
        switchAuthTab(mode);
    }

    function closeAuthModal() {
        elements.authModal.classList.add('hidden');
        elements.loginError.classList.add('hidden');
        elements.registerError.classList.add('hidden');
    }

    function switchAuthTab(tab) {
        if (tab === 'login') {
            elements.tabLoginBtn.classList.add('active');
            elements.tabRegisterBtn.classList.remove('active');
            elements.loginForm.classList.remove('hidden');
            elements.registerForm.classList.add('hidden');
        } else {
            elements.tabRegisterBtn.classList.add('active');
            elements.tabLoginBtn.classList.remove('active');
            elements.registerForm.classList.remove('hidden');
            elements.loginForm.classList.add('hidden');
        }
    }

    // --- HELPER UTILITIES ---
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;

        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconClass = {
            'success': 'fa-solid fa-circle-check',
            'error': 'fa-solid fa-circle-exclamation',
            'info': 'fa-solid fa-circle-info'
        }[type] || 'fa-solid fa-circle-info';

        toast.innerHTML = `<i class="${iconClass}"></i> <span>${escapeHTML(message)}</span>`;
        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(40px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
});
