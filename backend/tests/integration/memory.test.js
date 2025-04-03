// Integration tests for memory management
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');
const Relationship = require('../src/models/Relationship');
const Memory = require('../src/models/Memory');
const path = require('path');
const fs = require('fs');
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

describe('Memory Management API', () => {
  let testUser;
  let partnerUser;
  let activeRelationship;
  let completedRelationship;

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

    // Create an active relationship
    activeRelationship = new Relationship({
      name: 'Active Relationship',
      type: 'Friendship',
      creator: testUser._id,
      partner: partnerUser._id,
      frequency: 'Weekly',
      duration: 90,
      status: 'Active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    });
    await activeRelationship.save();

    // Create a completed relationship
    completedRelationship = new Relationship({
      name: 'Completed Relationship',
      type: 'Friendship',
      creator: testUser._id,
      partner: partnerUser._id,
      frequency: 'Weekly',
      duration: 90,
      status: 'Completed',
      startDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    });
    await completedRelationship.save();

    // Create test uploads directory
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  });

  afterEach(async () => {
    await Memory.deleteMany({});
  });

  afterAll(async () => {
    await Relationship.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should add a text-only memory to an active relationship', async () => {
    const response = await request(app)
      .post(`/api/memories/relationship/${activeRelationship._id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({
        text: 'This is a test memory'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('text', 'This is a test memory');
    expect(response.body).toHaveProperty('relationshipId', activeRelationship._id.toString());
    expect(response.body.userId).toHaveProperty('name', 'Test User');
    expect(response.body).toHaveProperty('attachments');
    expect(response.body.attachments).toHaveLength(0);
  });

  it('should not allow adding memories to completed relationships', async () => {
    const response = await request(app)
      .post(`/api/memories/relationship/${completedRelationship._id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({
        text: 'This should not be allowed'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Can only add memories to active relationships');
  });

  it('should get memories for a completed relationship', async () => {
    // Add test memories to the completed relationship
    const memory1 = new Memory({
      relationshipId: completedRelationship._id,
      userId: testUser._id,
      text: 'First test memory',
      attachments: []
    });
    await memory1.save();

    const memory2 = new Memory({
      relationshipId: completedRelationship._id,
      userId: partnerUser._id,
      text: 'Second test memory',
      attachments: []
    });
    await memory2.save();

    const response = await request(app)
      .get(`/api/memories/relationship/${completedRelationship._id}`)
      .set('Authorization', 'Bearer valid-token')
      .send();

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('text', 'First test memory');
    expect(response.body[1]).toHaveProperty('text', 'Second test memory');
  });

  it('should not allow accessing memories for active relationships', async () => {
    const response = await request(app)
      .get(`/api/memories/relationship/${activeRelationship._id}`)
      .set('Authorization', 'Bearer valid-token')
      .send();

    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty('message', 'Memories are only available after the relationship is completed');
  });

  it('should require either text or attachments when adding a memory', async () => {
    const response = await request(app)
      .post(`/api/memories/relationship/${activeRelationship._id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Either text or attachments are required');
  });
});
