const request = require('supertest');
const app = require('../server');
const { getAuthToken } = require('./authHelper');

describe('Profile API', () => {
  let token;

  beforeAll(async () => {
    token = await getAuthToken('student');
  });

  it('should get profile details', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('should update profile', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Updated bio' });
    expect(res.statusCode).toBe(200);
  });

  it('should get profile stats', async () => {
    const res = await request(app)
      .get('/api/profile/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('should update profile stats', async () => {
    const res = await request(app)
      .put('/api/profile/stats')
      .set('Authorization', `Bearer ${token}`)
      .send({ progress: 50 });
    expect(res.statusCode).toBe(200);
  });

  it('should add achievement', async () => {
    const res = await request(app)
      .post('/api/profile/achievements')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Achievement' });
    expect(res.statusCode).toBe(201);
  });
});
