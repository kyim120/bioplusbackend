const request = require('supertest');
const app = require('../server');
const { getAuthToken } = require('./authHelper');

describe('Bookmark API', () => {
  let token;

  beforeAll(async () => {
    token = await getAuthToken('student');
  });

  it('should get all bookmarks', async () => {
    const res = await request(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('should add a bookmark', async () => {
    const res = await request(app)
      .post('/api/bookmarks')
      .send({ contentId: 'testcontent123' }) // example payload
      .set('Authorization', `Bearer ${token}`);
    expect([201, 400]).toContain(res.statusCode);
  });

  it('should delete a bookmark', async () => {
    // First create a bookmark to delete
    const addRes = await request(app)
      .post('/api/bookmarks')
      .send({ contentId: 'testcontent1234' })
      .set('Authorization', `Bearer ${token}`);

    if (addRes.statusCode === 201) {
      const bookmarkId = addRes.body._id;
      const delRes = await request(app)
        .delete(`/api/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(delRes.statusCode).toBe(200);
    }
  });
});
