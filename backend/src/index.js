const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const { initializeFirebase } = require('./services/authService');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Initialize Firebase Admin
initializeFirebase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/relationships', require('./routes/relationshipRoutes'));
app.use('/api/memories', require('./routes/memoryRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/exports', require('./routes/exportRoutes'));

// Base route
app.get('/', (req, res) => {
  res.send('Memory in a Jar API is running');
});

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));
} else {
  console.log('MongoDB URI not provided, database connection skipped');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
