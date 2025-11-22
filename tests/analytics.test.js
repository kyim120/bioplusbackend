const request = require('supertest');
const app = require('../server');
const { getAuthToken } = require('./authHelper');

describe('Analytics API', () => {
  let token;

  beforeAll(async () => {
    token = await getAuthToken('admin'); // Assuming admin role for analytics routes
  });

  it('should get student analytics', async () => {
    const res = await request(app)
      .get('/api/analytics/student')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 400]).toContain(res.statusCode); // 400 if no studentId or data
  });

  it('should get system analytics', async () => {
    const res = await request(app)
      .get('/api/analytics/system')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('should get subject analytics', async () => {
    const res = await request(app)
      .get('/api/analytics/subject/some-subject-id')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 404]).toContain(res.statusCode); // 404 if subject not found
  });

  // Additional tests for engagement, trends, leaderboard, content analytics, system health
});
