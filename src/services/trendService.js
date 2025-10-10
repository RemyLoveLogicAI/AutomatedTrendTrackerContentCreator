const { TwitterApi } = require('twitter-api-v2');
const snoowrap = require('snoowrap');
const { google } = require('googleapis');
const googleTrends = require('google-trends-api');
const { HfInference } = require('@huggingface/inference');
const logger = require('../utils/logger');

class TrendService {
  constructor() {
    // Initialize API clients
    this.initializeClients();
  }

  initializeClients() {
    // Twitter client
    if (process.env.TWITTER_BEARER_TOKEN) {
      this.twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    }

    // Reddit client
    if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
      this.redditClient = new snoowrap({
        userAgent: 'TrendTracker/1.0',
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        username: process.env.REDDIT_USERNAME,
        password: process.env.REDDIT_PASSWORD
      });
    }

    // YouTube client
    if (process.env.YOUTUBE_API_KEY) {
      this.youtubeClient = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API_KEY
      });
    }

    // Hugging Face for NLP
    if (process.env.HUGGINGFACE_API_KEY) {
      this.hfInference = new HfInference(process.env.HUGGINGFACE_API_KEY);
    }
  }

  // Get Twitter trending topics
  async getTwitterTrends(limit = 10) {
    try {
      if (!this.twitterClient) {
        logger.warn('Twitter API not configured, returning mock data');
        return this.getMockTrends('twitter', limit);
      }

      // Search for trending topics using Twitter API v2
      const response = await this.twitterClient.v2.search('trending', {
        max_results: limit,
        'tweet.fields': 'public_metrics,created_at'
      });

      const trends = response.data.data.map((tweet, index) => ({
        id: `twitter_${index + 1}`,
        topic: tweet.text.substring(0, 100),
        source: 'twitter',
        popularity: tweet.public_metrics.like_count + tweet.public_metrics.retweet_count,
        timestamp: tweet.created_at,
        metadata: {
          likes: tweet.public_metrics.like_count,
          retweets: tweet.public_metrics.retweet_count,
          replies: tweet.public_metrics.reply_count
        }
      }));

      return trends;
    } catch (error) {
      logger.error('Error fetching Twitter trends:', error);
      return this.getMockTrends('twitter', limit);
    }
  }

  // Get Reddit trending topics
  async getRedditTrends(subreddit = 'all', limit = 10) {
    try {
      if (!this.redditClient) {
        logger.warn('Reddit API not configured, returning mock data');
        return this.getMockTrends('reddit', limit);
      }

      const hot = await this.redditClient.getSubreddit(subreddit).getHot({ limit });

      const trends = hot.map((post, index) => ({
        id: `reddit_${post.id}`,
        topic: post.title,
        source: 'reddit',
        popularity: post.score,
        url: `https://reddit.com${post.permalink}`,
        timestamp: new Date(post.created_utc * 1000).toISOString(),
        metadata: {
          score: post.score,
          comments: post.num_comments,
          subreddit: post.subreddit.display_name,
          author: post.author.name
        }
      }));

      return trends;
    } catch (error) {
      logger.error('Error fetching Reddit trends:', error);
      return this.getMockTrends('reddit', limit);
    }
  }

  // Get YouTube trending videos
  async getYouTubeTrends(region = 'US', limit = 10) {
    try {
      if (!this.youtubeClient) {
        logger.warn('YouTube API not configured, returning mock data');
        return this.getMockTrends('youtube', limit);
      }

      const response = await this.youtubeClient.videos.list({
        part: 'snippet,statistics',
        chart: 'mostPopular',
        regionCode: region,
        maxResults: limit
      });

      const trends = response.data.items.map((video) => ({
        id: `youtube_${video.id}`,
        topic: video.snippet.title,
        source: 'youtube',
        popularity: parseInt(video.statistics.viewCount),
        url: `https://www.youtube.com/watch?v=${video.id}`,
        timestamp: video.snippet.publishedAt,
        metadata: {
          views: video.statistics.viewCount,
          likes: video.statistics.likeCount,
          comments: video.statistics.commentCount,
          channel: video.snippet.channelTitle,
          description: video.snippet.description
        }
      }));

      return trends;
    } catch (error) {
      logger.error('Error fetching YouTube trends:', error);
      return this.getMockTrends('youtube', limit);
    }
  }

  // Get Google Trends
  async getGoogleTrends(geo = 'US', limit = 10) {
    try {
      const response = await googleTrends.dailyTrends({
        geo: geo
      });

      const data = JSON.parse(response);
      const trendingSearches = data.default.trendingSearchesDays[0].trendingSearches;

      const trends = trendingSearches.slice(0, limit).map((trend, index) => ({
        id: `google_${index + 1}`,
        topic: trend.title.query,
        source: 'google',
        popularity: parseInt(trend.formattedTraffic.replace(/[^0-9]/g, '')) || 0,
        timestamp: new Date().toISOString(),
        metadata: {
          traffic: trend.formattedTraffic,
          articles: trend.articles.length,
          relatedQueries: trend.relatedQueries
        }
      }));

      return trends;
    } catch (error) {
      logger.error('Error fetching Google trends:', error);
      return this.getMockTrends('google', limit);
    }
  }

  // Aggregate trends from all sources
  async getAggregatedTrends(limit = 10, language = 'en') {
    try {
      const [twitter, reddit, youtube, google] = await Promise.all([
        this.getTwitterTrends(5),
        this.getRedditTrends('all', 5),
        this.getYouTubeTrends('US', 5),
        this.getGoogleTrends('US', 5)
      ]);

      const allTrends = [...twitter, ...reddit, ...youtube, ...google];
      
      // Sort by popularity and return top trends
      const sorted = allTrends.sort((a, b) => b.popularity - a.popularity);
      
      return sorted.slice(0, limit);
    } catch (error) {
      logger.error('Error aggregating trends:', error);
      return this.getMockTrends('all', limit);
    }
  }

  // Get trends by specific source
  async getTrendsBySource(source, limit = 10, language = 'en') {
    switch (source.toLowerCase()) {
      case 'twitter':
        return this.getTwitterTrends(limit);
      case 'reddit':
        return this.getRedditTrends('all', limit);
      case 'youtube':
        return this.getYouTubeTrends('US', limit);
      case 'google':
        return this.getGoogleTrends('US', limit);
      default:
        throw new Error(`Unknown source: ${source}`);
    }
  }

  // Analyze trends using NLP
  async analyzeTrendsWithNLP(trends) {
    try {
      if (!this.hfInference) {
        logger.warn('Hugging Face API not configured, returning trends without NLP analysis');
        return trends.map((trend, index) => ({
          ...trend,
          nlpScore: 100 - index * 5,
          sentiment: 'neutral',
          topics: []
        }));
      }

      // Analyze each trend
      const analyzed = await Promise.all(
        trends.map(async (trend) => {
          try {
            // Sentiment analysis
            const sentiment = await this.hfInference.textClassification({
              model: 'distilbert-base-uncased-finetuned-sst-2-english',
              inputs: trend.topic
            });

            return {
              ...trend,
              nlpScore: Math.round(trend.popularity * (sentiment[0].score || 1)),
              sentiment: sentiment[0].label,
              sentimentScore: sentiment[0].score
            };
          } catch (error) {
            logger.error('Error in NLP analysis:', error);
            return {
              ...trend,
              nlpScore: trend.popularity,
              sentiment: 'neutral'
            };
          }
        })
      );

      // Sort by NLP score
      return analyzed.sort((a, b) => b.nlpScore - a.nlpScore);
    } catch (error) {
      logger.error('Error analyzing trends with NLP:', error);
      return trends;
    }
  }

  // Mock trends for development/testing
  getMockTrends(source, limit) {
    const mockData = [
      { id: 1, topic: 'AI and Machine Learning', popularity: 95 },
      { id: 2, topic: 'ChatGPT and LLMs', popularity: 90 },
      { id: 3, topic: 'Climate Change Solutions', popularity: 85 },
      { id: 4, topic: 'Space Exploration', popularity: 80 },
      { id: 5, topic: 'Quantum Computing', popularity: 75 },
      { id: 6, topic: 'Electric Vehicles', popularity: 70 },
      { id: 7, topic: 'Renewable Energy', popularity: 65 },
      { id: 8, topic: 'Cryptocurrency Trends', popularity: 60 },
      { id: 9, topic: 'Web3 and Metaverse', popularity: 55 },
      { id: 10, topic: 'Healthcare Innovation', popularity: 50 }
    ];

    return mockData.slice(0, limit).map(trend => ({
      ...trend,
      source: source,
      timestamp: new Date().toISOString(),
      metadata: {
        note: 'This is mock data. Configure API keys to get real trends.'
      }
    }));
  }
}

module.exports = new TrendService();
