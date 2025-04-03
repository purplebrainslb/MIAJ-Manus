// Unit tests for Export model
const mongoose = require('mongoose');
const Export = require('../src/models/Export');
const User = require('../src/models/User');
const Relationship = require('../src/models/Relationship');

describe('Export Model Test', () => {
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
      name: 'Export Test User',
      email: 'export_test@example.com',
      authProvider: 'Google',
      firebaseUid: 'firebase_export_test'
    });
    await user.save();

    // Create test relationship
    relationship = new Relationship({
      name: 'Export Test Relationship',
      type: 'Friendship',
      creator: user._id,
      partner: user._id, // Using same user for simplicity in tests
      frequency: 'Weekly',
      duration: 90,
      status: 'Completed' // Completed status for export testing
    });
    await relationship.save();
  });

  // Clear all test data after each test
  afterEach(async () => {
    await Export.deleteMany({});
  });

  // Disconnect and close connection after all tests
  afterAll(async () => {
    await Relationship.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Test case for saving a PDF export
  it('should create & save PDF export successfully', async () => {
    const validExport = new Export({
      relationshipId: relationship._id,
      userId: user._id,
      type: 'pdf',
      status: 'pending'
    });
    
    const savedExport = await validExport.save();
    
    expect(savedExport._id).toBeDefined();
    expect(savedExport.relationshipId.toString()).toBe(relationship._id.toString());
    expect(savedExport.userId.toString()).toBe(user._id.toString());
    expect(savedExport.type).toBe('pdf');
    expect(savedExport.status).toBe('pending');
    expect(savedExport.url).toBeUndefined();
    expect(savedExport.expiresAt).toBeUndefined();
    expect(savedExport.createdAt).toBeDefined();
    expect(savedExport.updatedAt).toBeDefined();
  });

  // Test case for saving a video export
  it('should create & save video export successfully', async () => {
    const validExport = new Export({
      relationshipId: relationship._id,
      userId: user._id,
      type: 'video',
      status: 'pending'
    });
    
    const savedExport = await validExport.save();
    
    expect(savedExport._id).toBeDefined();
    expect(savedExport.type).toBe('video');
  });

  // Test case for completed export with URL and expiration
  it('should save completed export with URL and expiration date', async () => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // 30 days from now
    
    const completedExport = new Export({
      relationshipId: relationship._id,
      userId: user._id,
      type: 'pdf',
      status: 'completed',
      url: 'https://example.com/exports/test-export.pdf',
      expiresAt: expirationDate
    });
    
    const savedExport = await completedExport.save();
    
    expect(savedExport._id).toBeDefined();
    expect(savedExport.status).toBe('completed');
    expect(savedExport.url).toBe('https://example.com/exports/test-export.pdf');
    expect(savedExport.expiresAt).toEqual(expirationDate);
  });

  // Test case for required fields
  it('should fail when required fields are missing', async () => {
    const exportWithoutRequiredField = new Export({
      type: 'pdf',
      status: 'pending'
    });
    
    let err;
    try {
      await exportWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  // Test case for type enum validation
  it('should fail for invalid export type', async () => {
    const exportWithInvalidType = new Export({
      relationshipId: relationship._id,
      userId: user._id,
      type: 'invalid', // Not in enum
      status: 'pending'
    });
    
    let err;
    try {
      await exportWithInvalidType.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.type).toBeDefined();
  });

  // Test case for status enum validation
  it('should fail for invalid export status', async () => {
    const exportWithInvalidStatus = new Export({
      relationshipId: relationship._id,
      userId: user._id,
      type: 'pdf',
      status: 'invalid' // Not in enum
    });
    
    let err;
    try {
      await exportWithInvalidStatus.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.status).toBeDefined();
  });
});
