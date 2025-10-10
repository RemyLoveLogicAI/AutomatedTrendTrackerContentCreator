const express = require('express');
const router = express.Router();
const twitterService = require('../services/trendDetection/twitterService');
const redditService = require('../services/trendDetection/redditService');
const youtubeService = require('../services/trendDetection/youtubeService');
const googleTrendsService = require('../services/trendDetection/googleTrendsService');
const trendRanker = require('../services/ml/trendRanker');
const logger = require('../services/logger');

/**
 * GET /api/trends
 * Fetch and aggregate trends from multiple sources
 */
router.get('/', async (req, res, next) => {
  try {
    const { source, limit = 10, region = 'US', category } = req.query;

    logger.info(`Fetching trends - source: ${source || 'all'}, limit: ${limit}, region: ${region}`);

    let trends = [];

    // Fetch from specific source or all sources
    if (!source || source === 'twitter') {
      const twitterTrends = await twitterService.getTrends(region);
      trends = trends.concat(twitterTrends.map(t => ({ ...t, source: 'twitter' })));
    }

    if (!source || source === 'reddit') {
      const redditTrends = await redditService.getTrends(limit);
      trends = trends.concat(redditTrends.map(t => ({ ...t, source: 'reddit' })));
    }

    if (!source || source === 'youtube') {
      const youtubeTrends = await youtubeService.getTrends(region, category);
      trends = trends.concat(youtubeTrends.map(t => ({ ...t, source: 'youtube' })));
    }

    if (!source || source === 'google') {
      const googleTrends = await googleTrendsService.getTrends(region);
      trends = trends.concat(googleTrends.map(t => ({ ...t, source: 'google' })));
    }

    // Rank trends using ML-based analysis
    const rankedTrends = await trendRanker.rankTrends(trends);

    // Return top trends
    const topTrends = rankedTrends.slice(0, parseInt(limit));

    res.json({
      success: true,
      count: topTrends.length,
      data: topTrends,
      metadata: {
        region,
        sources: source || 'all',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching trends:', error);
    next(error);
  }
});

/**
 * GET /api/trends/:id
 * Get detailed information about a specific trend
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { source } = req.query;

    logger.info(`Fetching trend details - id: ${id}, source: ${source}`);

    let trendDetails;

    switch (source) {
      case 'twitter':
        trendDetails = await twitterService.getTrendDetails(id);
        break;
      case 'reddit':
        trendDetails = await redditService.getTrendDetails(id);
        break;
      case 'youtube':
        trendDetails = await youtubeService.getTrendDetails(id);
        break;
      case 'google':
        trendDetails = await googleTrendsService.getTrendDetails(id);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Source parameter is required (twitter, reddit, youtube, or google)'
        });
    }

    res.json({
      success: true,
      data: trendDetails
    });
  } catch (error) {
    logger.error('Error fetching trend details:', error);
    next(error);
  }
});

/**
 * POST /api/trends/analyze
 * Analyze custom text or topic for trending potential
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { text, topic } = req.body;

    if (!text && !topic) {
      return res.status(400).json({
        success: false,
        error: 'Either text or topic is required'
      });
    }

    logger.info(`Analyzing trend potential for: ${topic || text.substring(0, 50)}`);

    const analysis = await trendRanker.analyzeTrendPotential(text || topic);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Error analyzing trend:', error);
    next(error);
  }
});

module.exports = router;
