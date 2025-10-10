const Bull = require('bull');
const redis = require('../config/redis');
const logger = require('../utils/logger');
const trendService = require('../services/trendService');

// Create queue for trend fetching
const trendQueue = new Bull('trend-fetching', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  }
});

// Process trend fetching jobs
trendQueue.process(async (job) => {
  const { source, limit } = job.data;
  logger.info(`Processing trend fetch job: ${source}`);

  try {
    const trends = await trendService.getTrendsBySource(source, limit);
    return { success: true, count: trends.length, trends };
  } catch (error) {
    logger.error(`Error processing trend job:`, error);
    throw error;
  }
});

// Event handlers
trendQueue.on('completed', (job, result) => {
  logger.info(`Trend job ${job.id} completed:`, result);
});

trendQueue.on('failed', (job, err) => {
  logger.error(`Trend job ${job.id} failed:`, err);
});

// Add job to queue
const fetchTrends = async (source, limit = 10) => {
  const job = await trendQueue.add(
    { source, limit },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    }
  );
  return job;
};

module.exports = { trendQueue, fetchTrends };
