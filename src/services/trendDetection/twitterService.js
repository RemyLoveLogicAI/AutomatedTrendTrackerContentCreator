const { TwitterApi } = require('twitter-api-v2');
const logger = require('../logger');

let client = null;

/**
 * Initialize Twitter client
 */
function initClient() {
  if (!client && process.env.TWITTER_BEARER_TOKEN) {
    try {
      client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    } catch (error) {
      logger.error('Failed to initialize Twitter client:', error);
    }
  }
  return client;
}

/**
 * Twitter Service for trend detection
 */
const twitterService = {
  /**
   * Get trending topics from Twitter
   */
  async getTrends(region = 'US') {
    try {
      const twitterClient = initClient();
      
      if (!twitterClient) {
        logger.warn('Twitter client not available, returning mock data');
        return this.getMockTrends();
      }

      // WOEID mapping for regions
      const woeidMap = {
        'US': 23424977,
        'UK': 23424975,
        'CA': 23424775,
        'AU': 23424748,
        'IN': 23424848
      };

      const woeid = woeidMap[region] || woeidMap['US'];

      // Fetch trending topics
      const trends = await twitterClient.v1.trendsAvailable(woeid);
      
      return trends.map((trend, index) => ({
        id: `twitter_${index}`,
        topic: trend.name,
        popularity: trend.tweet_volume || Math.floor(Math.random() * 100000),
        url: trend.url,
        description: `Trending on Twitter in ${region}`
      }));
    } catch (error) {
      logger.error('Error fetching Twitter trends:', error);
      return this.getMockTrends();
    }
  },

  /**
   * Get detailed information about a trend
   */
  async getTrendDetails(trendId) {
    try {
      const twitterClient = initClient();
      
      if (!twitterClient) {
        return this.getMockTrendDetails(trendId);
      }

      // Search for tweets related to the trend
      const query = trendId.replace('twitter_', '');
      const tweets = await twitterClient.v2.search(query, {
        max_results: 10,
        'tweet.fields': 'created_at,public_metrics,author_id'
      });

      return {
        id: trendId,
        topic: query,
        tweets: tweets.data || [],
        metadata: tweets.meta || {}
      };
    } catch (error) {
      logger.error('Error fetching Twitter trend details:', error);
      return this.getMockTrendDetails(trendId);
    }
  },

  /**
   * Mock trends for fallback
   */
  getMockTrends() {
    return [
      { id: 'twitter_1', topic: 'AI', popularity: 95000, description: 'Artificial Intelligence trending' },
      { id: 'twitter_2', topic: 'ChatGPT', popularity: 85000, description: 'OpenAI ChatGPT discussions' },
      { id: 'twitter_3', topic: 'Climate Change', popularity: 72000, description: 'Environmental discussions' },
      { id: 'twitter_4', topic: 'Tech Innovation', popularity: 68000, description: 'Technology trends' },
      { id: 'twitter_5', topic: 'Web3', popularity: 55000, description: 'Blockchain and Web3 topics' }
    ];
  },

  /**
   * Mock trend details for fallback
   */
  getMockTrendDetails(trendId) {
    return {
      id: trendId,
      topic: 'Mock Trend',
      tweets: [],
      metadata: { result_count: 0 }
    };
  }
};

module.exports = twitterService;
