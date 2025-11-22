const request = require('supertest');
const app = require('../server');

describe('Auth API', () => {
  const userData = {
    email: 'testuser@example.com',
    password: 'Test1234!',
    name: 'Test User'
  };

  let token = '';

  it('should signup a new user', async () => {
    const res = await request(app).post('/api/auth/signup').send(userData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  it('should not signup with existing email', async () => {
    const res = await request(app).post('/api/auth/signup').send(userData);
    expect(res.statusCode).toBe(400);
  });

  it('should login an existing user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should get user info with token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', userData.email);
  });

  it('should fail login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: 'wrongpassword'
    });
    expect(res.statusCode).toBe(401);
  });

  it('should request password reset', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: userData.email
    });
    expect(res.statusCode).toBe(200);
  });

  // Additional tests for verify email, reset password, logout can be added similarly
});
