// Unit tests for Notification model
const mongoose = require('mongoose');
const Notification = require('../src/models/Notification');
const User = require('../src/models/User');
const Relationship = require('../src/models/Relationship');

describe('Notification Model Test', () => {
  // Mock user and relationship
  let user;
  let relationship;

  // Connect to the MongoDB Memory Server
  beforeAll(async () => {
    // Use a test database connection string
    const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-memory-in-a-jar';
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create test user
    user = new User({
      name: 'Notification Test User',
      email: 'notification_test@example.com',
      authProvider: 'Google',
      firebaseUid: 'firebase_notification_test'
    });
    await user.save();

    // Create test relationship
    relationship = new Relationship({
      name: 'Notification Test Relationship',
      type: 'Friendship',
      creator: user._id,
      partner: user._id, // Using same user for simplicity in tests
      frequency: 'Weekly',
      duration: 90,
      status: 'Active'
    });
    await relationship.save();
  });

  // Clear all test data after each test
  afterEach(async () => {
    await Notification.deleteMany({});
  });

  // Disconnect and close connection after all tests
  afterAll(async () => {
    await Relationship.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Test case for saving a reminder notification
  it('should create & save reminder notification successfully', async () => {
    const scheduledDate = new Date();
    const validNotification = new Notification({
      userId: user._id,
      relationshipId: relationship._id,
      type: 'reminder',
      status: 'pending',
      scheduledFor: scheduledDate
    });
    
    const savedNotification = await validNotification.save();
    
    expect(savedNotification._id).toBeDefined();
    expect(savedNotification.userId.toString()).toBe(user._id.toString());
    expect(savedNotification.relationshipId.toString()).toBe(relationship._id.toString());
    expect(savedNotification.type).toBe('reminder');
    expect(savedNotification.status).toBe('pending');
    expect(savedNotification.scheduledFor).toEqual(scheduledDate);
    expect(savedNotification.createdAt).toBeDefined();
  });

  // Test case for saving a reveal notification
  it('should create & save reveal notification successfully', async () => {
    const scheduledDate = new Date();
    const validNotification = new Notification({
      userId: user._id,
      relationshipId: relationship._id,
      type: 'reveal',
      status: 'pending',
      scheduledFor: scheduledDate
    });
    
    const savedNotification = await validNotification.save();
    
    expect(savedNotification._id).toBeDefined();
    expect(savedNotification.userId.toString()).toBe(user._id.toString());
    expect(savedNotification.relationshipId.toString()).toBe(relationship._id.toString());
    expect(savedNotification.type).toBe('reveal');
    expect(savedNotification.status).toBe('pending');
    expect(savedNotification.scheduledFor).toEqual(scheduledDate);
  });

  // Test case for saving an invitation notification
  it('should create & save invitation notification successfully', async () => {
    const scheduledDate = new Date();
    const validNotification = new Notification({
      userId: user._id,
      relationshipId: relationship._id,
      type: 'invitation',
      status: 'pending',
      scheduledFor: scheduledDate
    });
    
    const savedNotification = await validNotification.save();
    
    expect(savedNotification._id).toBeDefined();
    expect(savedNotification.type).toBe('invitation');
  });

  // Test case for required fields
  it('should fail when required fields are missing', async () => {
    const notificationWithoutRequiredField = new Notification({
      type: 'reminder',
      status: 'pending'
    });
    
    let err;
    try {
      await notificationWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  // Test case for type enum validation
  it('should fail for invalid notification type', async () => {
    const notificationWithInvalidType = new Notification({
      userId: user._id,
      relationshipId: relationship._id,
      type: 'invalid', // Not in enum
      status: 'pending',
      scheduledFor: new Date()
    });
    
    let err;
    try {
      await notificationWithInvalidType.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.type).toBeDefined();
  });

  // Test case for status enum validation
  it('should fail for invalid notification status', async () => {
    const notificationWithInvalidStatus = new Notification({
      userId: user._id,
      relationshipId: relationship._id,
      type: 'reminder',
      status: 'invalid', // Not in enum
      scheduledFor: new Date()
    });
    
    let err;
    try {
      await notificationWithInvalidStatus.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.status).toBeDefined();
  });
});
