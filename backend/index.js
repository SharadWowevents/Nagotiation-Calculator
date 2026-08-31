require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const entriesRoutes = require('./routes/entries');
const Settings = require('./models/Settings');

const app = express();

// Middleware

app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Seed Settings if they don't exist
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      console.log('Seeding default settings...');
      await Settings.create({});
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/entries', entriesRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});