const snoowrap = require('snoowrap');
const logger = require('../logger');

let client = null;

/**
 * Initialize Reddit client
 */
function initClient() {
  if (!client && process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
    try {
      client = new snoowrap({
        userAgent: 'TrendTracker/1.0.0',
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        username: process.env.REDDIT_USERNAME,
        password: process.env.REDDIT_PASSWORD
      });
    } catch (error) {
      logger.error('Failed to initialize Reddit client:', error);
    }
  }
  return client;
}

/**
 * Reddit Service for trend detection
 */
const redditService = {
  /**
   * Get trending topics from Reddit
   */
  async getTrends(limit = 10) {
    try {
      const redditClient = initClient();
      
      if (!redditClient) {
        logger.warn('Reddit client not available, returning mock data');
        return this.getMockTrends();
      }

      // Fetch hot posts from r/all
      const posts = await redditClient.getHot('all', { limit });
      
      return posts.map((post, index) => ({
        id: `reddit_${post.id}`,
        topic: post.title,
        popularity: post.score,
        url: `https://reddit.com${post.permalink}`,
        subreddit: post.subreddit.display_name,
        comments: post.num_comments,
        description: post.selftext?.substring(0, 200) || 'Trending on Reddit'
      }));
    } catch (error) {
      logger.error('Error fetching Reddit trends:', error);
      return this.getMockTrends();
    }
  },

  /**
   * Get detailed information about a trend
   */
  async getTrendDetails(postId) {
    try {
      const redditClient = initClient();
      
      if (!redditClient) {
        return this.getMockTrendDetails(postId);
      }

      const cleanId = postId.replace('reddit_', '');
      const submission = await redditClient.getSubmission(cleanId).fetch();
      
      return {
        id: postId,
        topic: submission.title,
        content: submission.selftext,
        score: submission.score,
        comments: submission.num_comments,
        author: submission.author.name,
        subreddit: submission.subreddit.display_name,
        url: `https://reddit.com${submission.permalink}`,
        created: new Date(submission.created_utc * 1000)
      };
    } catch (error) {
      logger.error('Error fetching Reddit trend details:', error);
      return this.getMockTrendDetails(postId);
    }
  },

  /**
   * Mock trends for fallback
   */
  getMockTrends() {
    return [
      { id: 'reddit_1', topic: 'New AI breakthrough', popularity: 12500, subreddit: 'technology', comments: 450 },
      { id: 'reddit_2', topic: 'Climate action updates', popularity: 9800, subreddit: 'worldnews', comments: 320 },
      { id: 'reddit_3', topic: 'Gaming industry trends', popularity: 8500, subreddit: 'gaming', comments: 280 },
      { id: 'reddit_4', topic: 'Space exploration news', popularity: 7200, subreddit: 'space', comments: 195 },
      { id: 'reddit_5', topic: 'Programming best practices', popularity: 6500, subreddit: 'programming', comments: 150 }
    ];
  },

  /**
   * Mock trend details for fallback
   */
  getMockTrendDetails(postId) {
    return {
      id: postId,
      topic: 'Mock Reddit Post',
      content: 'Mock content',
      score: 0,
      comments: 0
    };
  }
};

module.exports = redditService;
