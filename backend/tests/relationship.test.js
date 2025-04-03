// Unit tests for Relationship model
const mongoose = require('mongoose');
const Relationship = require('../src/models/Relationship');
const User = require('../src/models/User');

describe('Relationship Model Test', () => {
  // Mock users
  let creator;
  let partner;

  // Connect to the MongoDB Memory Server
  beforeAll(async () => {
    // Use a test database connection string
    const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-memory-in-a-jar';
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create test users
    creator = new User({
      name: 'Creator User',
      email: 'creator@example.com',
      authProvider: 'Google',
      firebaseUid: 'firebase_creator'
    });
    await creator.save();

    partner = new User({
      name: 'Partner User',
      email: 'partner@example.com',
      authProvider: 'Google',
      firebaseUid: 'firebase_partner'
    });
    await partner.save();
  });

  // Clear all test data after each test
  afterEach(async () => {
    await Relationship.deleteMany({});
  });

  // Disconnect and close connection after all tests
  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Test case for saving a relationship
  it('should create & save relationship successfully', async () => {
    const validRelationship = new Relationship({
      name: 'Test Relationship',
      type: 'Friendship',
      creator: creator._id,
      partner: partner._id,
      frequency: 'Weekly',
      duration: 90, // 3 months in days
      revealTheme: 'neutral',
      status: 'Pending'
    });
    
    const savedRelationship = await validRelationship.save();
    
    // Object Id should be defined when successfully saved to MongoDB
    expect(savedRelationship._id).toBeDefined();
    expect(savedRelationship.name).toBe('Test Relationship');
    expect(savedRelationship.type).toBe('Friendship');
    expect(savedRelationship.creator.toString()).toBe(creator._id.toString());
    expect(savedRelationship.partner.toString()).toBe(partner._id.toString());
    expect(savedRelationship.frequency).toBe('Weekly');
    expect(savedRelationship.duration).toBe(90);
    expect(savedRelationship.revealTheme).toBe('neutral');
    expect(savedRelationship.status).toBe('Pending');
    expect(savedRelationship.createdAt).toBeDefined();
    expect(savedRelationship.updatedAt).toBeDefined();
  });

  // Test case for required fields
  it('should fail when required fields are missing', async () => {
    const relationshipWithoutRequiredField = new Relationship({
      name: 'Incomplete Relationship'
    });
    
    let err;
    try {
      await relationshipWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  // Test case for enum validation
  it('should fail for invalid frequency value', async () => {
    const relationshipWithInvalidFrequency = new Relationship({
      name: 'Invalid Frequency Relationship',
      type: 'Friendship',
      creator: creator._id,
      partner: partner._id,
      frequency: 'Invalid', // Not in enum
      duration: 90,
      revealTheme: 'neutral',
      status: 'Pending'
    });
    
    let err;
    try {
      await relationshipWithInvalidFrequency.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.frequency).toBeDefined();
  });

  // Test case for status enum validation
  it('should fail for invalid status value', async () => {
    const relationshipWithInvalidStatus = new Relationship({
      name: 'Invalid Status Relationship',
      type: 'Friendship',
      creator: creator._id,
      partner: partner._id,
      frequency: 'Weekly',
      duration: 90,
      revealTheme: 'neutral',
      status: 'Invalid' // Not in enum
    });
    
    let err;
    try {
      await relationshipWithInvalidStatus.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.status).toBeDefined();
  });
});
