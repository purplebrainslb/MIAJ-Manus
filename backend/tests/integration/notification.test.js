// Integration tests for notification management
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');
const Relationship = require('../src/models/Relationship');
const Notification = require('../src/models/Notification');
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

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

describe('Notification Management API', () => {
  let testUser;
  let partnerUser;
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
    await Notification.deleteMany({});
  });

  afterAll(async () => {
    await Relationship.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should get user notifications', async () => {
    // Create test notifications
    const notification1 = new Notification({
      userId: testUser._id,
      relationshipId: activeRelationship._id,
      type: 'reminder',
      status: 'pending',
      scheduledFor: new Date()
    });
    await notification1.save();

    const notification2 = new Notification({
      userId: testUser._id,
      relationshipId: activeRelationship._id,
      type: 'invitation',
      status: 'sent',
      scheduledFor: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });
    await notification2.save();

    const response = await request(app)
      .get('/api/notifications')
      .set('Authorization', 'Bearer valid-token')
      .send();

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('type');
    expect(response.body[0]).toHaveProperty('status');
    expect(response.body[0]).toHaveProperty('scheduledFor');
  });

  it('should mark a notification as read', async () => {
    // Create test notification
    const notification = new Notification({
      userId: testUser._id,
      relationshipId: activeRelationship._id,
      type: 'reminder',
      status: 'sent',
      scheduledFor: new Date()
    });
    await notification.save();

    const response = await request(app)
      .put(`/api/notifications/${notification._id}/read`)
      .set('Authorization', 'Bearer valid-token')
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'read');

    // Verify notification is marked as read in database
    const updatedNotification = await Notification.findById(notification._id);
    expect(updatedNotification.status).toBe('read');
  });

  it('should create a memory reminder notification', async () => {
    const response = await request(app)
      .post(`/api/notifications/reminder/relationship/${activeRelationship._id}`)
      .set('Authorization', 'Bearer valid-token')
      .send();

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('type', 'reminder');
    expect(response.body).toHaveProperty('status', 'sent'); // Changed from pending to sent by the sendEmailNotification function
    expect(response.body).toHaveProperty('relationshipId', activeRelationship._id.toString());

    // Verify notification is created in database
    const notifications = await Notification.find({ relationshipId: activeRelationship._id });
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('reminder');
  });

  it('should not allow creating reminders for relationships user is not part of', async () => {
    // Create a relationship where test user is not a participant
    const otherRelationship = new Relationship({
      name: 'Other Relationship',
      type: 'Friendship',
      creator: mongoose.Types.ObjectId(),
      partner: mongoose.Types.ObjectId(),
      frequency: 'Weekly',
      duration: 90,
      status: 'Active'
    });
    await otherRelationship.save();

    const response = await request(app)
      .post(`/api/notifications/reminder/relationship/${otherRelationship._id}`)
      .set('Authorization', 'Bearer valid-token')
      .send();

    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty('message', 'Not authorized to create reminders for this relationship');
  });
});
