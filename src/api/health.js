const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'not configured',
      redis: 'not configured',
      apis: {
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
        twitter: process.env.TWITTER_BEARER_TOKEN ? 'configured' : 'not configured',
        youtube: process.env.YOUTUBE_API_KEY ? 'configured' : 'not configured'
      }
    }
  };

  res.status(200).json(health);
});

module.exports = router;
