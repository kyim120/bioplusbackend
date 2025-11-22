const request = require('supertest');
const app = require('../server');
const { getAuthToken } = require('./authHelper');

describe('Book API', () => {
  let token;

  beforeAll(async () => {
    token = await getAuthToken('student'); // Assuming student role for book routes
  });

  it('should get all books', async () => {
    const res = await request(app)
      .get('/api/books')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('should get popular books', async () => {
    const res = await request(app)
      .get('/api/books/popular')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('should get recent books', async () => {
    const res = await request(app)
      .get('/api/books/recent')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('should search books', async () => {
    const res = await request(app)
      .get('/api/books/search')
      .query({ q: 'biology' })
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  // Additional tests for book details, progress, ratings, and admin book management can be added similarly
});
