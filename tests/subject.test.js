const request = require('supertest');
const app = require('../server');
const { getAuthToken } = require('./authHelper');

describe('Subject API', () => {
  let token;

  beforeAll(async () => {
    token = await getAuthToken('student');
  });

  it('should get all subjects', async () => {
    const res = await request(app)
      .get('/api/subjects')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  // Add more tests for specific subject endpoints if available
});
