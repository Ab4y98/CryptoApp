const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.post('/', auth, async (req, res) => {
  try {
    const { assets, investorType, contentTypes } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.preferences = {
      assets: assets || [],
      investorType: investorType || '',
      contentTypes: contentTypes || [],
    };

    await user.save();

    res.json({
      message: 'Preferences saved successfully',
      preferences: user.preferences,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

