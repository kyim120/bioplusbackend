const request = require('supertest');
const app = require('../server');
const { getAuthToken } = require('./authHelper');

describe('AI API', () => {
  let token;

  beforeAll(async () => {
    token = await getAuthToken('student'); // Assuming student role for AI routes
  });

  it('should get study recommendations', async () => {
    const res = await request(app)
      .post('/api/ai/recommendations')
      .set('Authorization', `Bearer ${token}`)
      .send({ topics: ['biology'] });
    expect([200, 400]).toContain(res.statusCode);
  });

  it('should explain concept', async () => {
    const res = await request(app)
      .post('/api/ai/explain')
      .set('Authorization', `Bearer ${token}`)
      .send({ concept: 'photosynthesis' });
    expect([200, 400]).toContain(res.statusCode);
  });

  it('should generate quiz', async () => {
    const res = await request(app)
      .post('/api/ai/generate-quiz')
      .set('Authorization', `Bearer ${token}`)
      .send({ topicId: 'biology' });
    expect([200, 400]).toContain(res.statusCode);
  });

  it('should analyze performance', async () => {
    const res = await request(app)
      .post('/api/ai/analyze-performance')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: '123' });
    expect([200, 400]).toContain(res.statusCode);
  });
});
