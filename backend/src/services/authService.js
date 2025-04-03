const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin with service account
const initializeFirebase = () => {
  // In production, this would use actual credentials from environment variables
  // For development, we're using a placeholder approach
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // The private key needs to be properly formatted from the environment variable
          privateKey: process.env.FIREBASE_PRIVATE_KEY ? 
            process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
};

// Create or retrieve user from database based on Firebase auth
const createOrGetUser = async (firebaseUser) => {
  try {
    // Check if user exists
    let user = await User.findOne({ firebaseUid: firebaseUser.uid });
    
    // If user doesn't exist, create new user
    if (!user) {
      user = new User({
        name: firebaseUser.name || firebaseUser.displayName,
        email: firebaseUser.email,
        firebaseUid: firebaseUser.uid,
        authProvider: firebaseUser.firebase.sign_in_provider === 'google.com' ? 'Google' : 'Facebook'
      });
      
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error('Error in createOrGetUser:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  createOrGetUser
};
