import os
import json
import unittest
from app import app
from database import init_db, DB_PATH

class BlogPlatformTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if os.path.exists(DB_PATH):
            os.remove(DB_PATH)
        init_db()

    def setUp(self):
        app.config['TESTING'] = True
        app.config['SECRET_KEY'] = 'test_secret_key'
        self.client = app.test_client()

    def test_01_categories_and_tags(self):
        res = self.client.get('/api/categories')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('categories', data)
        self.assertGreater(len(data['categories']), 0)

        res_tags = self.client.get('/api/tags')
        self.assertEqual(res_tags.status_code, 200)
        tags_data = json.loads(res_tags.data)
        self.assertIn('tags', tags_data)

    def test_02_stats_and_posts_feed(self):
        res = self.client.get('/api/stats')
        self.assertEqual(res.status_code, 200)
        stats = json.loads(res.data)
        self.assertIn('total_posts', stats)
        self.assertGreaterEqual(stats['total_posts'], 3)

        res_posts = self.client.get('/api/posts')
        self.assertEqual(res_posts.status_code, 200)
        posts_data = json.loads(res_posts.data)
        self.assertIn('posts', posts_data)
        self.assertGreater(len(posts_data['posts']), 0)

    def test_03_auth_flow(self):
        # Register new user
        reg_payload = {
            'username': 'testuser_qa',
            'email': 'qa@example.com',
            'password': 'password123',
            'full_name': 'QA Tester',
            'bio': 'Software Tester'
        }
        res_reg = self.client.post('/api/auth/register', data=json.dumps(reg_payload), content_type='application/json')
        self.assertEqual(res_reg.status_code, 201)
        reg_data = json.loads(res_reg.data)
        self.assertEqual(reg_data['user']['username'], 'testuser_qa')

        # Check /api/auth/me
        res_me = self.client.get('/api/auth/me')
        self.assertEqual(res_me.status_code, 200)
        me_data = json.loads(res_me.data)
        self.assertEqual(me_data['user']['username'], 'testuser_qa')

        # Logout
        res_out = self.client.post('/api/auth/logout')
        self.assertEqual(res_out.status_code, 200)

        # Login back in
        login_payload = {
            'login': 'testuser_qa',
            'password': 'password123'
        }
        res_login = self.client.post('/api/auth/login', data=json.dumps(login_payload), content_type='application/json')
        self.assertEqual(res_login.status_code, 200)

    def test_04_post_crud_and_comments(self):
        # Login as testuser_qa
        login_payload = {'login': 'testuser_qa', 'password': 'password123'}
        self.client.post('/api/auth/login', data=json.dumps(login_payload), content_type='application/json')

        # 1. Create Post
        post_payload = {
            'title': 'Test Automation in Web Apps',
            'content': '### Introduction to Automated Testing\nAutomated tests ensure high quality code!',
            'summary': 'A guide to testing web apps.',
            'category_id': 1,
            'tags': ['Testing', 'QA', 'Python'],
            'status': 'published'
        }
        res_create = self.client.post('/api/posts', data=json.dumps(post_payload), content_type='application/json')
        self.assertEqual(res_create.status_code, 201)
        create_data = json.loads(res_create.data)
        post_id = create_data['post']['id']

        # 2. Fetch Created Post
        res_post = self.client.get(f'/api/posts/{post_id}')
        self.assertEqual(res_post.status_code, 200)

        # 3. Like Post
        res_like = self.client.post(f'/api/posts/{post_id}/like')
        self.assertEqual(res_like.status_code, 200)
        like_data = json.loads(res_like.data)
        self.assertTrue(like_data['liked'])

        # 4. Add Top-level Comment
        comment_payload = {'content': 'This is a test comment.'}
        res_comment = self.client.post(f'/api/posts/{post_id}/comments', data=json.dumps(comment_payload), content_type='application/json')
        self.assertEqual(res_comment.status_code, 201)
        parent_comment_id = json.loads(res_comment.data)['comment']['id']

        # 5. Add Nested Reply Comment
        reply_payload = {'content': 'This is a nested reply.', 'parent_id': parent_comment_id}
        res_reply = self.client.post(f'/api/posts/{post_id}/comments', data=json.dumps(reply_payload), content_type='application/json')
        self.assertEqual(res_reply.status_code, 201)

        # 6. Fetch Comments Tree
        res_tree = self.client.get(f'/api/posts/{post_id}/comments')
        self.assertEqual(res_tree.status_code, 200)
        tree_data = json.loads(res_tree.data)
        self.assertEqual(len(tree_data['comments']), 1)
        self.assertEqual(len(tree_data['comments'][0]['replies']), 1)

        # 7. Update Post
        update_payload = {'title': 'Updated Title: Test Automation', 'content': 'Updated content with details.'}
        res_update = self.client.put(f'/api/posts/{post_id}', data=json.dumps(update_payload), content_type='application/json')
        self.assertEqual(res_update.status_code, 200)

        # 8. Delete Comment
        res_del_comm = self.client.delete(f'/api/comments/{parent_comment_id}')
        self.assertEqual(res_del_comm.status_code, 200)

        # 9. Delete Post
        res_del_post = self.client.delete(f'/api/posts/{post_id}')
        self.assertEqual(res_del_post.status_code, 200)

if __name__ == '__main__':
    unittest.main()
