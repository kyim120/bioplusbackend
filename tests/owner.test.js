const request = require('supertest');
const app = require('../server');
const { getAuthToken } = require('./authHelper');

describe('Owner API', () => {
  let token;

  beforeAll(async () => {
    token = await getAuthToken('owner');
  });

  it('should get system analytics', async () => {
    const res = await request(app)
      .get('/api/owner/analytics/system')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('should get revenue analytics', async () => {
    const res = await request(app)
      .get('/api/owner/analytics/revenue')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('should get user management info', async () => {
    const res = await request(app)
      .get('/api/owner/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  // Additional tests for user status update, role update, deletion, system health, and content management can be added similarly
});
