// Integration tests for relationship management
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');
const Relationship = require('../src/models/Relationship');
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

describe('Relationship Management API', () => {
  let testUser;
  let partnerUser;

  beforeAll(async () => {
    // Use a test database connection string
    const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-memory-in-a-jar';
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create test users
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      authProvider: 'Google',
      firebaseUid: 'test-firebase-uid'
    });
    await testUser.save();

    partnerUser = new User({
      name: 'Partner User',
      email: 'partner@example.com',
      authProvider: 'Google',
      firebaseUid: 'partner-firebase-uid'
    });
    await partnerUser.save();
  });

  afterEach(async () => {
    await Relationship.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create a new relationship', async () => {
    const response = await request(app)
      .post('/api/relationships')
      .set('Authorization', 'Bearer valid-token')
      .send({
        name: 'Test Relationship',
        type: 'Friendship',
        partnerEmail: 'partner@example.com',
        frequency: 'Weekly',
        duration: '3 months',
        revealTheme: 'neutral'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('name', 'Test Relationship');
    expect(response.body).toHaveProperty('type', 'Friendship');
    expect(response.body).toHaveProperty('frequency', 'Weekly');
    expect(response.body).toHaveProperty('status', 'Pending');
    expect(response.body.creator).toHaveProperty('email', 'test@example.com');
    expect(response.body.partner).toHaveProperty('email', 'partner@example.com');
  });

  it('should get all relationships for current user', async () => {
    // Create a test relationship
    const relationship = new Relationship({
      name: 'Test Relationship',
      type: 'Friendship',
      creator: testUser._id,
      partner: partnerUser._id,
      frequency: 'Weekly',
      duration: 90,
      status: 'Pending'
    });
    await relationship.save();

    const response = await request(app)
      .get('/api/relationships')
      .set('Authorization', 'Bearer valid-token')
      .send();

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toHaveProperty('name', 'Test Relationship');
  });

  it('should get a specific relationship by ID', async () => {
    // Create a test relationship
    const relationship = new Relationship({
      name: 'Test Relationship',
      type: 'Friendship',
      creator: testUser._id,
      partner: partnerUser._id,
      frequency: 'Weekly',
      duration: 90,
      status: 'Pending'
    });
    await relationship.save();

    const response = await request(app)
      .get(`/api/relationships/${relationship._id}`)
      .set('Authorization', 'Bearer valid-token')
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('name', 'Test Relationship');
    expect(response.body).toHaveProperty('type', 'Friendship');
  });

  it('should accept a relationship invitation', async () => {
    // Mock Firebase Admin to return partner user
    admin.auth().verifyIdToken.mockResolvedValueOnce({
      uid: 'partner-firebase-uid',
      email: 'partner@example.com',
      name: 'Partner User',
      firebase: {
        sign_in_provider: 'google.com'
      }
    });

    // Create a test relationship
    const relationship = new Relationship({
      name: 'Test Relationship',
      type: 'Friendship',
      creator: testUser._id,
      partner: partnerUser._id,
      frequency: 'Weekly',
      duration: 90,
      status: 'Pending'
    });
    await relationship.save();

    const response = await request(app)
      .put(`/api/relationships/${relationship._id}/accept`)
      .set('Authorization', 'Bearer partner-token')
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'Active');
    expect(response.body).toHaveProperty('startDate');
    expect(response.body).toHaveProperty('endDate');
  });

  it('should delete a relationship', async () => {
    // Create a test relationship
    const relationship = new Relationship({
      name: 'Test Relationship',
      type: 'Friendship',
      creator: testUser._id,
      partner: partnerUser._id,
      frequency: 'Weekly',
      duration: 90,
      status: 'Active'
    });
    await relationship.save();

    const response = await request(app)
      .delete(`/api/relationships/${relationship._id}`)
      .set('Authorization', 'Bearer valid-token')
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Relationship deleted successfully');

    // Verify relationship is marked as deleted
    const deletedRelationship = await Relationship.findById(relationship._id);
    expect(deletedRelationship.status).toBe('Deleted');
  });
});
