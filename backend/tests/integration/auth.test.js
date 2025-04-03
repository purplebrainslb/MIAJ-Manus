// Integration tests for user authentication
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');
const admin = require('firebase-admin');

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: 'test-firebase-uid',
      email: 'test@example.com',
      name: 'Test User',
      firebase: {
        sign_in_provider: 'google.com'
      }
    })
  })
}));

describe('User Authentication API', () => {
  beforeAll(async () => {
    // Use a test database connection string
    const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-memory-in-a-jar';
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should authenticate a user with valid token', async () => {
    const response = await request(app)
      .post('/api/users/auth')
      .set('Authorization', 'Bearer valid-token')
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name', 'Test User');
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });

  it('should return 401 for missing token', async () => {
    const response = await request(app)
      .post('/api/users/auth')
      .send();

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized: No token provided');
  });

  it('should get current user profile', async () => {
    // First authenticate to create the user
    await request(app)
      .post('/api/users/auth')
      .set('Authorization', 'Bearer valid-token')
      .send();

    // Then get the user profile
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer valid-token')
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('name', 'Test User');
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });

  it('should update user profile', async () => {
    // First authenticate to create the user
    await request(app)
      .post('/api/users/auth')
      .set('Authorization', 'Bearer valid-token')
      .send();

    // Then update the user profile
    const response = await request(app)
      .put('/api/users/me')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Updated Name' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('name', 'Updated Name');
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });
});
