// Unit tests for User model
const mongoose = require('mongoose');
const User = require('../src/models/User');

// Mock data
const mockUser = {
  name: 'Test User',
  email: 'test@example.com',
  authProvider: 'Google',
  firebaseUid: 'firebase123'
};

describe('User Model Test', () => {
  // Connect to the MongoDB Memory Server
  beforeAll(async () => {
    // Use a test database connection string
    const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-memory-in-a-jar';
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  // Clear all test data after each test
  afterEach(async () => {
    await User.deleteMany({});
  });

  // Disconnect and close connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test case for saving a user
  it('should create & save user successfully', async () => {
    const validUser = new User(mockUser);
    const savedUser = await validUser.save();
    
    // Object Id should be defined when successfully saved to MongoDB
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(mockUser.name);
    expect(savedUser.email).toBe(mockUser.email);
    expect(savedUser.authProvider).toBe(mockUser.authProvider);
    expect(savedUser.firebaseUid).toBe(mockUser.firebaseUid);
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
  });

  // Test case for required fields
  it('should fail when required fields are missing', async () => {
    const userWithoutRequiredField = new User({ name: 'Test User' });
    let err;
    
    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  // Test case for unique fields
  it('should fail for duplicate email', async () => {
    // Create the first user
    const firstUser = new User(mockUser);
    await firstUser.save();
    
    // Create a second user with the same email
    const secondUser = new User({
      ...mockUser,
      firebaseUid: 'different123' // Different UID but same email
    });
    
    let err;
    try {
      await secondUser.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // MongoDB duplicate key error code
  });
});
