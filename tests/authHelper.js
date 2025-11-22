const request = require('supertest');
const app = require('../server');

async function getAuthToken(role = 'student') {
  // You might adapt this to your actual logic for users in your DB
  const signupData = {
    email: role + '@test.com',
    password: 'Test1234!',
    name: role + ' Test'
  };

  // Try signup first - ignore errors if user already exists
  try {
    await request(app).post('/api/auth/signup').send(signupData);
  } catch (e) {}

  // Login to get token
  const res = await request(app).post('/api/auth/login').send({
    email: signupData.email,
    password: signupData.password,
  });
  return res.body.token || res.body.accessToken || null;
}

module.exports = {
  getAuthToken,
};
