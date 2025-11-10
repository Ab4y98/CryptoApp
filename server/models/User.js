const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  preferences: {
    assets: {
      type: [String],
      default: [],
    },
    investorType: {
      type: String,
      enum: ['HODLer', 'Day Trader', 'NFT Collector', 'DeFi Enthusiast', 'Crypto Newbie'],
    },
    contentTypes: {
      type: [String],
      default: [],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastSeenAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);

