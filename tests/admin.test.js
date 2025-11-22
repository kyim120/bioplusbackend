const request = require('supertest');
const app = require('../server');
const { getAuthToken } = require('./authHelper');

describe('Admin API', () => {
  let token;

  beforeAll(async () => {
    token = await getAuthToken('admin');
  });

  it('should get admin dashboard', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('should get users list', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Add tests for user creation, update, delete

  it('should create a user', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'newuser@example.com',
        password: 'Test1234!',
        name: 'New User',
        role: 'student'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('email', 'newuser@example.com');
  });

  it('should update a user', async () => {
    const usersRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    const userId = usersRes.body.length > 0 ? usersRes.body[0]._id : null;
    if (userId) {
      const res = await request(app)
        .put(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', 'Updated Name');
    }
  });

  it('should delete a user', async () => {
    const usersRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    const userId = usersRes.body.length > 0 ? usersRes.body[0]._id : null;
    if (userId) {
      const res = await request(app)
        .delete(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    }
  });

  // Similar tests can be added for subjects, notes, tests, past papers, books, chapters, animations, notifications, and analytics endpoints
});
