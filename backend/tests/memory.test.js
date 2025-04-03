// Unit tests for Memory model
const mongoose = require('mongoose');
const Memory = require('../src/models/Memory');
const User = require('../src/models/User');
const Relationship = require('../src/models/Relationship');

describe('Memory Model Test', () => {
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
      name: 'Memory Test User',
      email: 'memory_test@example.com',
      authProvider: 'Google',
      firebaseUid: 'firebase_memory_test'
    });
    await user.save();

    // Create test relationship
    relationship = new Relationship({
      name: 'Memory Test Relationship',
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
    await Memory.deleteMany({});
  });

  // Disconnect and close connection after all tests
  afterAll(async () => {
    await Relationship.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Test case for saving a memory with text only
  it('should create & save text-only memory successfully', async () => {
    const validMemory = new Memory({
      relationshipId: relationship._id,
      userId: user._id,
      text: 'This is a test memory',
      attachments: []
    });
    
    const savedMemory = await validMemory.save();
    
    expect(savedMemory._id).toBeDefined();
    expect(savedMemory.relationshipId.toString()).toBe(relationship._id.toString());
    expect(savedMemory.userId.toString()).toBe(user._id.toString());
    expect(savedMemory.text).toBe('This is a test memory');
    expect(savedMemory.attachments).toHaveLength(0);
    expect(savedMemory.createdAt).toBeDefined();
    expect(savedMemory.updatedAt).toBeDefined();
  });

  // Test case for saving a memory with attachments
  it('should create & save memory with attachments successfully', async () => {
    const validMemory = new Memory({
      relationshipId: relationship._id,
      userId: user._id,
      text: 'Memory with attachments',
      attachments: [
        {
          type: 'image',
          url: '/uploads/test-image.jpg',
          size: 1024000
        },
        {
          type: 'video',
          url: '/uploads/test-video.mp4',
          thumbnailUrl: '/uploads/test-video-thumb.jpg',
          size: 5120000
        }
      ]
    });
    
    const savedMemory = await validMemory.save();
    
    expect(savedMemory._id).toBeDefined();
    expect(savedMemory.relationshipId.toString()).toBe(relationship._id.toString());
    expect(savedMemory.userId.toString()).toBe(user._id.toString());
    expect(savedMemory.text).toBe('Memory with attachments');
    expect(savedMemory.attachments).toHaveLength(2);
    expect(savedMemory.attachments[0].type).toBe('image');
    expect(savedMemory.attachments[1].type).toBe('video');
    expect(savedMemory.attachments[1].thumbnailUrl).toBe('/uploads/test-video-thumb.jpg');
  });

  // Test case for required fields
  it('should fail when required fields are missing', async () => {
    const memoryWithoutRequiredField = new Memory({
      text: 'Missing required fields'
    });
    
    let err;
    try {
      await memoryWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  // Test case for attachment type validation
  it('should fail for invalid attachment type', async () => {
    const memoryWithInvalidAttachment = new Memory({
      relationshipId: relationship._id,
      userId: user._id,
      text: 'Invalid attachment type',
      attachments: [
        {
          type: 'invalid', // Not in enum
          url: '/uploads/test-file.txt',
          size: 1000
        }
      ]
    });
    
    let err;
    try {
      await memoryWithInvalidAttachment.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors['attachments.0.type']).toBeDefined();
  });

  // Test case for memory without text but with attachments
  it('should create memory with attachments but no text', async () => {
    const memoryWithoutText = new Memory({
      relationshipId: relationship._id,
      userId: user._id,
      attachments: [
        {
          type: 'image',
          url: '/uploads/test-image.jpg',
          size: 1024000
        }
      ]
    });
    
    const savedMemory = await memoryWithoutText.save();
    
    expect(savedMemory._id).toBeDefined();
    expect(savedMemory.text).toBeUndefined();
    expect(savedMemory.attachments).toHaveLength(1);
  });
});
