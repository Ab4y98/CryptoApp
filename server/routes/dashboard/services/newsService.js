const axios = require('axios');
const CachedNews = require('../../../models/CachedNews');

// Get market news from CryptoPanic API with MongoDB caching (no static fallback)
const getMarketNews = async () => {
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes (increased to reduce API calls)
  const now = new Date();
  const cacheExpiry = new Date(now.getTime() - CACHE_TTL);

  // Check database cache first (recent entries)
  const cachedNews = await CachedNews.find({
    fetchedAt: { $gte: cacheExpiry },
    source: 'cryptopanic' // Only use cached data from API, not fallback
  }).sort({ fetchedAt: -1 }).limit(5);

  if (cachedNews && cachedNews.length > 0) {
    console.log(`getMarketNews: Returning ${cachedNews.length} cached news items`);
    return cachedNews.map(item => ({
      id: item._id.toString(),
      title: item.title,
      url: item.url,
      source: 'CryptoPanic', // Cached items are from CryptoPanic API
      published_at: item.createdAt || item.fetchedAt,
      summary: item.summary || item.title,
      tags: item.tags || [],
    }));
  }
  
  console.log('getMarketNews: No fresh cache found, checking API...');

  // Check if API key is provided
  if (!process.env.CRYPTOPANIC_API_KEY) {
    console.error('CRYPTOPANIC_API_KEY is not set in environment variables');
    // Try to get any cached data (even expired) if no API key
    const anyCachedNews = await CachedNews.find({
      source: 'cryptopanic'
    }).sort({ fetchedAt: -1 }).limit(5);
    
    if (anyCachedNews && anyCachedNews.length > 0) {
      return anyCachedNews.map(item => ({
        id: item._id.toString(),
        title: item.title,
        url: item.url,
        source: 'CryptoPanic',
        published_at: item.createdAt || item.fetchedAt,
        summary: item.summary || item.title,
        tags: item.tags || [],
      }));
    }
    return []; // Return empty array if no API key and no cache
  }

  // Check for any cached data before making API call (to avoid unnecessary calls)
  const anyCachedNews = await CachedNews.find({
    source: 'cryptopanic'
  }).sort({ fetchedAt: -1 }).limit(5);

  try {
    const response = await axios.get('https://cryptopanic.com/api/developer/v2/posts/', {
      params: {
        auth_token: process.env.CRYPTOPANIC_API_KEY,
        public: true,
        filter: 'hot',
      },
      timeout: 5000,
    });
    
    // Debug: Log the full API response structure
    console.log('=== CryptoPanic API Response Debug ===');
    console.log('Response status:', response.status);
    console.log('Response data keys:', Object.keys(response.data || {}));
    console.log('Has results?', !!response.data?.results);
    console.log('Results type:', Array.isArray(response.data?.results) ? 'array' : typeof response.data?.results);
    console.log('Results length:', response.data?.results?.length);
    
    if (response.data?.results && response.data.results.length > 0) {
      console.log('First result sample:', JSON.stringify(response.data.results[0], null, 2));
    } else {
      console.log('Full response data:', JSON.stringify(response.data, null, 2));
    }
    
    // Handle both v1 and v2 API response formats
    const results = response.data?.results || response.data?.data || [];
    
    if (!results || results.length === 0) {
      console.log('No results found in API response');
      return [];
    }
    
    console.log(`Processing ${results.length} news items from API`);
    
    const newsItems = results
      .map((item, index) => {
        // Log first item structure for debugging
        if (index === 0) {
          console.log('Sample item structure:', JSON.stringify(item, null, 2));
          console.log('Item keys:', Object.keys(item));
        }
        
        // According to CryptoPanic API v2 documentation:
        // - title: string (required)
        // - url: string (Cryptopanic-hosted article)
        // - original_url: string (Link to original article) - use this for external links
        // - description: string (Short summary)
        // - slug: string (URL-friendly identifier)
        // - instruments: array (NOT currencies) - List of instruments mentioned
        // - source: object with title, domain, etc.
        
        const title = item.title || '';
        // Construct URL from slug if original_url/url not available
        let url = item.original_url || item.url || '';
        if (!url && item.slug) {
          // Construct CryptoPanic URL from slug
          url = `https://cryptopanic.com/news/${item.slug}/`;
        }
        
        if (!title) {
          console.log(`Item ${index} missing title:`, { 
            itemKeys: Object.keys(item),
            itemId: item.id
          });
        }
        
        if (!url) {
          console.log(`Item ${index} missing URL, using fallback:`, { 
            hasSlug: !!item.slug,
            slug: item.slug,
            itemId: item.id
          });
          // Use a fallback URL if none available
          url = `https://cryptopanic.com/news/${item.slug || item.id}/`;
        }
        
        // Extract instrument codes from instruments array (if present)
        const tags = (item.instruments || []).map(inst => inst.code || inst.title || '').filter(Boolean);
        
        return {
          id: item.id ? `news-${item.id}` : `news-${index}`,
          title: title,
          url: url,
          source: item.source?.title || item.source?.domain || 'CryptoPanic',
          published_at: item.published_at || item.created_at || new Date().toISOString(),
          summary: item.description || item.title || '',
          tags: tags,
        };
      })
      .filter(item => item.title) // Only filter by title, URL is always constructed
      .slice(0, 5);
    
    console.log(`After filtering: ${newsItems.length} valid news items`);

    // Save to database cache (only items with valid url)
    await Promise.all(newsItems
      .filter(news => news.url && news.url !== '#') // Only save items with valid URLs
      .map(news => 
        new CachedNews({
          source: 'cryptopanic',
          title: news.title,
          url: news.url,
          summary: news.summary || '',
          tags: news.tags || [],
          createdAt: new Date(news.published_at),
          fetchedAt: now,
        }).save()
      )
    );

    // Return structured news items (matching API format)
    const formattedNews = newsItems.map(item => ({
      id: item.id,
      title: item.title,
      url: item.url,
      source: item.source,
      published_at: item.published_at,
      summary: item.summary,
      tags: item.tags,
    }));
    
    console.log(`getMarketNews: API call successful, returning ${formattedNews.length} news items`);
    return formattedNews;
  } catch (error) {
    // Handle rate limiting (429) - API quota exceeded
    if (error.response?.status === 429) {
      const errorInfo = error.response?.data?.info || error.response?.data?.message || 'Rate limit exceeded';
      console.warn(`CryptoPanic API rate limit reached: ${errorInfo}. Using cached data.`);
      
      // Use cached data we fetched earlier, or fetch it now
      const cachedData = anyCachedNews || await CachedNews.find({
        source: 'cryptopanic'
      }).sort({ fetchedAt: -1 }).limit(5);
      
      if (cachedData && cachedData.length > 0) {
        console.log(`getMarketNews: Rate limit hit, returning ${cachedData.length} cached news items`);
        return cachedData.map(item => ({
          id: item._id.toString(),
          title: item.title,
          url: item.url,
          source: 'CryptoPanic',
          published_at: item.createdAt || item.fetchedAt,
          summary: item.summary || item.title,
          tags: item.tags || [],
        }));
      }
      
      // If no cache available, return empty array
      console.warn('getMarketNews: No cached data available. API quota exceeded and no cache found.');
      return [];
    }
    
    // Log other errors
    console.error('CryptoPanic API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });
    
    // Try to get any cached data (even expired) on other errors
    const cachedData = anyCachedNews || await CachedNews.find({
      source: 'cryptopanic'
    }).sort({ fetchedAt: -1 }).limit(5);
    
    if (cachedData && cachedData.length > 0) {
      return cachedData.map(item => ({
        id: item._id.toString(),
        title: item.title,
        url: item.url,
        source: 'CryptoPanic',
        published_at: item.createdAt || item.fetchedAt,
        summary: item.summary || item.title,
        tags: item.tags || [],
      }));
    }
    
    // Return empty array on error if no cache available (no static fallback)
    return [];
  }
};

module.exports = {
  getMarketNews,
};

