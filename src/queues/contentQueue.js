const Bull = require('bull');
const logger = require('../utils/logger');
const contentService = require('../services/contentService');

// Create queue for content generation
const contentQueue = new Bull('content-generation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  }
});

// Process content generation jobs
contentQueue.process(async (job) => {
  const { type, data } = job.data;
  logger.info(`Processing content generation job: ${type}`);

  try {
    let result;
    switch (type) {
      case 'text':
        result = await contentService.generateText(data);
        break;
      case 'image':
        result = await contentService.generateImage(data);
        break;
      case 'voiceover':
        result = await contentService.generateVoiceover(data);
        break;
      case 'package':
        result = await contentService.generateContentPackage(data);
        break;
      default:
        throw new Error(`Unknown content type: ${type}`);
    }

    return { success: true, type, result };
  } catch (error) {
    logger.error(`Error processing content generation job:`, error);
    throw error;
  }
});

// Event handlers
contentQueue.on('completed', (job, result) => {
  logger.info(`Content job ${job.id} completed`);
});

contentQueue.on('failed', (job, err) => {
  logger.error(`Content job ${job.id} failed:`, err);
});

// Add job to queue
const generateContent = async (type, data) => {
  const job = await contentQueue.add(
    { type, data },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      timeout: 60000 // 60 seconds
    }
  );
  return job;
};

module.exports = { contentQueue, generateContent };
