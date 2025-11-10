const axios = require('axios');
const CachedPrice = require('../../../models/CachedPrice');

// Get coin prices from CoinGecko with MongoDB caching
const getCoinPrices = async (assets) => {
  const coinIds = assets.length > 0 ? assets : ['bitcoin', 'ethereum'];
  const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
  const now = new Date();
  const cacheExpiry = new Date(now.getTime() - CACHE_TTL);

  console.log('getCoinPrices: Requested coins:', coinIds);

  // Check database cache first
  const cachedPrices = await CachedPrice.find({
    coinId: { $in: coinIds },
    fetchedAt: { $gte: cacheExpiry }
  }).sort({ fetchedAt: -1 });

  // Group cached prices by coinId and get most recent for each
  const cachedPriceMap = new Map();
  if (cachedPrices && cachedPrices.length > 0) {
    cachedPrices.forEach(price => {
      if (!cachedPriceMap.has(price.coinId) || price.fetchedAt > cachedPriceMap.get(price.coinId).fetchedAt) {
        cachedPriceMap.set(price.coinId, price);
      }
    });
  }

  // Find which coins are missing from cache
  const cachedCoinIds = Array.from(cachedPriceMap.keys());
  const missingCoinIds = coinIds.filter(id => !cachedCoinIds.includes(id));

  console.log('getCoinPrices: Cached coins:', cachedCoinIds);
  console.log('getCoinPrices: Missing coins:', missingCoinIds);

  // If all coins are cached, return cached data
  if (missingCoinIds.length === 0 && cachedPriceMap.size > 0) {
    console.log('getCoinPrices: Returning all cached prices');
    return Array.from(cachedPriceMap.values()).map(price => ({
      id: `price-${price.coinId}`,
      coinId: price.coinId,
      name: price.coinId.charAt(0).toUpperCase() + price.coinId.slice(1),
      price: price.priceUsd,
      change24h: price.change24h || 0,
      marketCap: price.marketCap || 0,
    }));
  }

  // Fetch missing coins from API (or all if cache is empty)
  const coinsToFetch = missingCoinIds.length > 0 ? missingCoinIds : coinIds;
  console.log('getCoinPrices: Fetching from API:', coinsToFetch);

  try {
    const coinIdsString = coinsToFetch.join(',');
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price`,
      {
        params: {
          ids: coinIdsString,
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_market_cap: true,
        },
        timeout: 5000,
      }
    );

    const apiPrices = [];
    for (const [id, data] of Object.entries(response.data)) {
      const priceData = {
        coinId: id,
        priceUsd: data.usd,
        marketCap: data.usd_market_cap || 0,
        change24h: data.usd_24h_change || 0,
        fetchedAt: now,
      };

      // Save to database cache
      await new CachedPrice(priceData).save();

      // Add to API prices map
      cachedPriceMap.set(id, priceData);

      apiPrices.push({
        id: `price-${id}`,
        coinId: id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        price: data.usd,
        change24h: data.usd_24h_change || 0,
        marketCap: data.usd_market_cap || 0,
      });
    }

    console.log('getCoinPrices: Fetched from API:', apiPrices.length, 'coins');

    // Combine cached and API prices, ensuring all requested coins are included
    const allPrices = Array.from(cachedPriceMap.values())
      .filter(price => coinIds.includes(price.coinId))
      .map(price => ({
        id: `price-${price.coinId}`,
        coinId: price.coinId,
        name: price.coinId.charAt(0).toUpperCase() + price.coinId.slice(1),
        price: price.priceUsd,
        change24h: price.change24h || 0,
        marketCap: price.marketCap || 0,
      }));

    console.log('getCoinPrices: Returning combined prices:', allPrices.length, 'coins');
    return allPrices;
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn('CoinGecko API rate limit reached. Using cached data.');
      // Try to get any cached data (even expired)
      const anyCachedPrices = await CachedPrice.find({
        coinId: { $in: coinIds }
      }).sort({ fetchedAt: -1 });

      if (anyCachedPrices && anyCachedPrices.length > 0) {
        const priceMap = new Map();
        anyCachedPrices.forEach(price => {
          if (!priceMap.has(price.coinId) || price.fetchedAt > priceMap.get(price.coinId).fetchedAt) {
            priceMap.set(price.coinId, price);
          }
        });

        const fallbackPrices = Array.from(priceMap.values())
          .filter(price => coinIds.includes(price.coinId))
          .map(price => ({
            id: `price-${price.coinId}`,
            coinId: price.coinId,
            name: price.coinId.charAt(0).toUpperCase() + price.coinId.slice(1),
            price: price.priceUsd,
            change24h: price.change24h || 0,
            marketCap: price.marketCap || 0,
          }));

        console.log('getCoinPrices: Returning fallback cached prices:', fallbackPrices.length, 'coins');
        return fallbackPrices;
      }
    } else {
      console.error('CoinGecko API error:', error.response?.status || error.message);
    }

    // If we have some cached prices, return them even if API failed
    if (cachedPriceMap.size > 0) {
      const cachedOnlyPrices = Array.from(cachedPriceMap.values())
        .filter(price => coinIds.includes(price.coinId))
        .map(price => ({
          id: `price-${price.coinId}`,
          coinId: price.coinId,
          name: price.coinId.charAt(0).toUpperCase() + price.coinId.slice(1),
          price: price.priceUsd,
          change24h: price.change24h || 0,
          marketCap: price.marketCap || 0,
        }));
      console.log('getCoinPrices: Returning cached prices after API error:', cachedOnlyPrices.length, 'coins');
      return cachedOnlyPrices;
    }

    return [];
  }
};

module.exports = {
  getCoinPrices,
};

