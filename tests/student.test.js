const request = require('supertest');
const app = require('../server');
const { getAuthToken } = require('./authHelper');

describe('Student API', () => {
  let token;

  beforeAll(async () => {
    token = await getAuthToken('student');
  });

  it('should get student dashboard', async () => {
    const res = await request(app)
      .get('/api/student/dashboard')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('should get subjects', async () => {
    const res = await request(app)
      .get('/api/student/subjects')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get chapters for a subject', async () => {
    const subjectsRes = await request(app)
      .get('/api/student/subjects')
      .set('Authorization', `Bearer ${token}`);
    if (subjectsRes.body.length > 0) {
      const subjectId = subjectsRes.body[0]._id;
      const chaptersRes = await request(app)
        .get(`/api/student/subjects/${subjectId}/chapters`)
        .set('Authorization', `Bearer ${token}`);
      expect(chaptersRes.statusCode).toBe(200);
      expect(Array.isArray(chaptersRes.body)).toBe(true);
    }
  });

  // Similar tests can be added for notes, tests, test submission, past papers, animations, books, bookmarks, progress, analytics, etc.
});
