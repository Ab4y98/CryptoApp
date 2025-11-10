const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// Load .env from root directory (parent of server folder)
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();

// Middleware
// CORS configuration - allows frontend URL from environment or all origins in development
const corsOptions = {
  origin: process.env.FRONTEND_URL || process.env.APP_URL || '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files (images)
app.use('/uploads', express.static('./public/uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/onboarding', require('./routes/onboarding'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/profile', require('./routes/profile'));

// Connect to MongoDB
mongoose.connect('mongodb+srv://daniel:Aa123456!@cluster0.gnsqdoj.mongodb.net/blabla', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

