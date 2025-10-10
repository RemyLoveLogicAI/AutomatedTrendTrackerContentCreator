const googleTrends = require('google-trends-api');
const logger = require('../logger');

/**
 * Google Trends Service for trend detection
 */
const googleTrendsService = {
  /**
   * Get trending searches from Google Trends
   */
  async getTrends(region = 'US') {
    try {
      const results = await googleTrends.dailyTrends({
        trendDate: new Date(),
        geo: region
      });

      const data = JSON.parse(results);
      const trends = [];

      if (data.default && data.default.trendingSearchesDays) {
        const trendingSearches = data.default.trendingSearchesDays[0].trendingSearches;
        
        trendingSearches.forEach((search, index) => {
          trends.push({
            id: `google_${index}`,
            topic: search.title.query,
            popularity: parseInt(search.formattedTraffic.replace(/[^0-9]/g, '')) || 0,
            description: search.articles && search.articles[0] ? search.articles[0].title : '',
            relatedQueries: search.relatedQueries || []
          });
        });
      }

      return trends;
    } catch (error) {
      logger.error('Error fetching Google Trends:', error);
      return this.getMockTrends();
    }
  },

  /**
   * Get detailed trend information
   */
  async getTrendDetails(trendId) {
    try {
      const index = parseInt(trendId.replace('google_', ''));
      
      const results = await googleTrends.dailyTrends({
        trendDate: new Date(),
        geo: 'US'
      });

      const data = JSON.parse(results);
      
      if (data.default && data.default.trendingSearchesDays) {
        const search = data.default.trendingSearchesDays[0].trendingSearches[index];
        
        if (search) {
          return {
            id: trendId,
            topic: search.title.query,
            traffic: search.formattedTraffic,
            articles: search.articles || [],
            relatedQueries: search.relatedQueries || [],
            image: search.image ? search.image.imageUrl : null
          };
        }
      }

      return this.getMockTrendDetails(trendId);
    } catch (error) {
      logger.error('Error fetching Google Trends details:', error);
      return this.getMockTrendDetails(trendId);
    }
  },

  /**
   * Get interest over time for a keyword
   */
  async getInterestOverTime(keyword, timeRange = 'today 12-m') {
    try {
      const results = await googleTrends.interestOverTime({
        keyword,
        startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      });

      return JSON.parse(results);
    } catch (error) {
      logger.error('Error fetching interest over time:', error);
      return null;
    }
  },

  /**
   * Mock trends for fallback
   */
  getMockTrends() {
    return [
      { id: 'google_1', topic: 'Artificial Intelligence news', popularity: 100000, description: 'Latest AI developments' },
      { id: 'google_2', topic: 'Climate summit 2024', popularity: 85000, description: 'Global climate discussions' },
      { id: 'google_3', topic: 'New smartphone release', popularity: 72000, description: 'Tech product launches' },
      { id: 'google_4', topic: 'Sports championship', popularity: 68000, description: 'Major sporting events' },
      { id: 'google_5', topic: 'Entertainment awards', popularity: 55000, description: 'Celebrity news' }
    ];
  },

  /**
   * Mock trend details for fallback
   */
  getMockTrendDetails(trendId) {
    return {
      id: trendId,
      topic: 'Mock Google Trend',
      traffic: '100K+',
      articles: [],
      relatedQueries: []
    };
  }
};

module.exports = googleTrendsService;
