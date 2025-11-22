const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    name: 'Bio Plus API',
    version: '1.0.0',
    description: 'Educational platform backend API',
    endpoints: {
      auth: {
        base: '/api/auth',
        routes: [
          { method: 'POST', path: '/signup', description: 'Create new user account' },
          { method: 'POST', path: '/login', description: 'Login user' },
          { method: 'GET', path: '/me', description: 'Get current user', auth: true }
        ]
      },
      student: {
        base: '/api/student',
        description: 'Student features and content',
        auth: 'Required - Student role'
      },
      admin: {
        base: '/api/admin',
        description: 'Admin management features',
        auth: 'Required - Admin or Owner role'
      },
      owner: {
        base: '/api/owner',
        description: 'Owner system management',
        auth: 'Required - Owner role'
      },
      ai: {
        base: '/api/ai',
        description: 'AI-powered features',
        auth: 'Required'
      },
      public: {
        base: '/api/public',
        description: 'Public content and information',
        auth: 'Not required'
      }
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

module.exports = router;
