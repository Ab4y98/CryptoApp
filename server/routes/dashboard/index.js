const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { getMarketNews } = require('./services/newsService');
const { getCoinPrices } = require('./services/priceService');
const { getAIInsight } = require('./services/insightService');
const { getRandomMeme } = require('./services/memeService');

router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    const preferences = user.preferences || {};

    // Debug logging for preferences
    console.log('Dashboard route - User preferences:', JSON.stringify(preferences, null, 2));
    console.log('Dashboard route - Assets requested:', preferences.assets || []);

    // Fetch all dashboard data
    const [news, prices, insight, meme] = await Promise.all([
      getMarketNews(),
      getCoinPrices(preferences.assets || []),
      getAIInsight(preferences),
      Promise.resolve(getRandomMeme()),
    ]);

    // Debug logging
    console.log('Dashboard response - News count:', news?.length || 0);
    console.log('Dashboard response - Prices count:', prices?.length || 0);
    console.log('Dashboard response - Prices data:', prices?.map(p => p.coinId));
    console.log('Dashboard response - Content types:', preferences.contentTypes);

    res.json({
      news,
      prices,
      insight,
      meme,
      preferences: {
        assets: preferences.assets || [],
        investorType: preferences.investorType || '',
        contentTypes: preferences.contentTypes || [],
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard route error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

