// Define the endpoint for trend detection
const express = require('express');
const router = express.Router();
const trendService = require('../services/trendService');
const logger = require('../utils/logger');

// Get all trends from multiple sources
router.get('/trends', async (req, res) => {
  try {
    const { source, limit = 10, language = 'en' } = req.query;
    
    logger.info(`Fetching trends - source: ${source || 'all'}, limit: ${limit}`);
    
    let trends;
    if (source) {
      // Fetch from specific source
      trends = await trendService.getTrendsBySource(source, limit, language);
    } else {
      // Fetch from all sources and aggregate
      trends = await trendService.getAggregatedTrends(limit, language);
    }
    
    res.json({
      success: true,
      count: trends.length,
      data: trends
    });
  } catch (error) {
    logger.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get trending topics from Twitter/X
router.get('/trends/twitter', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const trends = await trendService.getTwitterTrends(limit);
    
    res.json({
      success: true,
      source: 'twitter',
      count: trends.length,
      data: trends
    });
  } catch (error) {
    logger.error('Error fetching Twitter trends:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get trending topics from Reddit
router.get('/trends/reddit', async (req, res) => {
  try {
    const { limit = 10, subreddit = 'all' } = req.query;
    const trends = await trendService.getRedditTrends(subreddit, limit);
    
    res.json({
      success: true,
      source: 'reddit',
      count: trends.length,
      data: trends
    });
  } catch (error) {
    logger.error('Error fetching Reddit trends:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get trending topics from YouTube
router.get('/trends/youtube', async (req, res) => {
  try {
    const { limit = 10, region = 'US' } = req.query;
    const trends = await trendService.getYouTubeTrends(region, limit);
    
    res.json({
      success: true,
      source: 'youtube',
      count: trends.length,
      data: trends
    });
  } catch (error) {
    logger.error('Error fetching YouTube trends:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get trending topics from Google Trends
router.get('/trends/google', async (req, res) => {
  try {
    const { limit = 10, geo = 'US' } = req.query;
    const trends = await trendService.getGoogleTrends(geo, limit);
    
    res.json({
      success: true,
      source: 'google',
      count: trends.length,
      data: trends
    });
  } catch (error) {
    logger.error('Error fetching Google trends:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analyze and rank trends using NLP
router.post('/trends/analyze', async (req, res) => {
  try {
    const { trends } = req.body;
    
    if (!trends || !Array.isArray(trends)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid trends data. Expected an array.'
      });
    }
    
    const analyzed = await trendService.analyzeTrendsWithNLP(trends);
    
    res.json({
      success: true,
      count: analyzed.length,
      data: analyzed
    });
  } catch (error) {
    logger.error('Error analyzing trends:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
