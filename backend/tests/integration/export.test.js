// Integration tests for export management
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');
const Relationship = require('../src/models/Relationship');
const Export = require('../src/models/Export');
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

describe('Export Management API', () => {
  let testUser;
  let partnerUser;
  let completedRelationship;
  let activeRelationship;

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
  });

  afterEach(async () => {
    await Export.deleteMany({});
  });

  afterAll(async () => {
    await Relationship.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should request a PDF export for a completed relationship', async () => {
    const response = await request(app)
      .post(`/api/exports/relationship/${completedRelationship._id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({
        type: 'pdf'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('type', 'pdf');
    expect(response.body).toHaveProperty('status', 'pending');
    expect(response.body).toHaveProperty('relationshipId', completedRelationship._id.toString());
    expect(response.body).toHaveProperty('userId');
  });

  it('should request a video export for a completed relationship', async () => {
    const response = await request(app)
      .post(`/api/exports/relationship/${completedRelationship._id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({
        type: 'video'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('type', 'video');
    expect(response.body).toHaveProperty('status', 'pending');
  });

  it('should not allow export requests for active relationships', async () => {
    const response = await request(app)
      .post(`/api/exports/relationship/${activeRelationship._id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({
        type: 'pdf'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Can only request exports for completed relationships');
  });

  it('should get exports for a relationship', async () => {
    // Create test exports
    const export1 = new Export({
      relationshipId: completedRelationship._id,
      userId: testUser._id,
      type: 'pdf',
      status: 'completed',
      url: 'https://example.com/exports/test-export.pdf',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    await export1.save();

    const export2 = new Export({
      relationshipId: completedRelationship._id,
      userId: testUser._id,
      type: 'video',
      status: 'processing'
    });
    await export2.save();

    const response = await request(app)
      .get(`/api/exports/relationship/${completedRelationship._id}`)
      .set('Authorization', 'Bearer valid-token')
      .send();

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('type');
    expect(response.body[0]).toHaveProperty('status');
    expect(response.body.find(e => e.type === 'pdf')).toHaveProperty('url');
    expect(response.body.find(e => e.type === 'pdf')).toHaveProperty('expiresAt');
  });

  it('should update export status', async () => {
    // Create test export
    const exportDoc = new Export({
      relationshipId: completedRelationship._id,
      userId: testUser._id,
      type: 'pdf',
      status: 'pending'
    });
    await exportDoc.save();

    const response = await request(app)
      .put(`/api/exports/${exportDoc._id}/status`)
      .set('Authorization', 'Bearer valid-token')
      .send({
        status: 'completed',
        url: 'https://example.com/exports/updated-export.pdf'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'completed');
    expect(response.body).toHaveProperty('url', 'https://example.com/exports/updated-export.pdf');
    expect(response.body).toHaveProperty('expiresAt');

    // Verify export is updated in database
    const updatedExport = await Export.findById(exportDoc._id);
    expect(updatedExport.status).toBe('completed');
    expect(updatedExport.url).toBe('https://example.com/exports/updated-export.pdf');
  });

  it('should require URL when marking export as completed', async () => {
    // Create test export
    const exportDoc = new Export({
      relationshipId: completedRelationship._id,
      userId: testUser._id,
      type: 'pdf',
      status: 'pending'
    });
    await exportDoc.save();

    const response = await request(app)
      .put(`/api/exports/${exportDoc._id}/status`)
      .set('Authorization', 'Bearer valid-token')
      .send({
        status: 'completed'
        // Missing URL
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'URL is required for completed exports');
  });
});
