const { google } = require('googleapis');
const logger = require('../logger');

let youtube = null;

/**
 * Initialize YouTube client
 */
function initClient() {
  if (!youtube && process.env.YOUTUBE_API_KEY) {
    try {
      youtube = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API_KEY
      });
    } catch (error) {
      logger.error('Failed to initialize YouTube client:', error);
    }
  }
  return youtube;
}

/**
 * YouTube Service for trend detection
 */
const youtubeService = {
  /**
   * Get trending videos from YouTube
   */
  async getTrends(region = 'US', category = null) {
    try {
      const youtubeClient = initClient();
      
      if (!youtubeClient) {
        logger.warn('YouTube client not available, returning mock data');
        return this.getMockTrends();
      }

      const params = {
        part: 'snippet,statistics',
        chart: 'mostPopular',
        regionCode: region,
        maxResults: 10
      };

      if (category) {
        params.videoCategoryId = category;
      }

      const response = await youtubeClient.videos.list(params);
      
      return response.data.items.map((video) => ({
        id: `youtube_${video.id}`,
        topic: video.snippet.title,
        popularity: parseInt(video.statistics.viewCount),
        url: `https://www.youtube.com/watch?v=${video.id}`,
        channel: video.snippet.channelTitle,
        views: video.statistics.viewCount,
        likes: video.statistics.likeCount,
        description: video.snippet.description.substring(0, 200)
      }));
    } catch (error) {
      logger.error('Error fetching YouTube trends:', error);
      return this.getMockTrends();
    }
  },

  /**
   * Get detailed information about a video
   */
  async getTrendDetails(videoId) {
    try {
      const youtubeClient = initClient();
      
      if (!youtubeClient) {
        return this.getMockTrendDetails(videoId);
      }

      const cleanId = videoId.replace('youtube_', '');
      
      const response = await youtubeClient.videos.list({
        part: 'snippet,statistics,contentDetails',
        id: cleanId
      });

      if (!response.data.items || response.data.items.length === 0) {
        return this.getMockTrendDetails(videoId);
      }

      const video = response.data.items[0];
      
      return {
        id: videoId,
        topic: video.snippet.title,
        description: video.snippet.description,
        channel: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        views: video.statistics.viewCount,
        likes: video.statistics.likeCount,
        comments: video.statistics.commentCount,
        duration: video.contentDetails.duration,
        url: `https://www.youtube.com/watch?v=${cleanId}`
      };
    } catch (error) {
      logger.error('Error fetching YouTube trend details:', error);
      return this.getMockTrendDetails(videoId);
    }
  },

  /**
   * Mock trends for fallback
   */
  getMockTrends() {
    return [
      { id: 'youtube_1', topic: 'AI Tutorial 2024', popularity: 1500000, channel: 'TechChannel', views: 1500000 },
      { id: 'youtube_2', topic: 'Latest Tech Review', popularity: 980000, channel: 'ReviewHub', views: 980000 },
      { id: 'youtube_3', topic: 'Coding Best Practices', popularity: 750000, channel: 'CodeMaster', views: 750000 },
      { id: 'youtube_4', topic: 'Science Explained', popularity: 620000, channel: 'ScienceDaily', views: 620000 },
      { id: 'youtube_5', topic: 'Future of Technology', popularity: 580000, channel: 'FutureTech', views: 580000 }
    ];
  },

  /**
   * Mock trend details for fallback
   */
  getMockTrendDetails(videoId) {
    return {
      id: videoId,
      topic: 'Mock Video',
      description: 'Mock description',
      views: 0,
      likes: 0
    };
  }
};

module.exports = youtubeService;
