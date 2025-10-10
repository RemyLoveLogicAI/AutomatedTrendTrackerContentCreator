const Queue = require('bull');
const logger = require('../logger');
const textGenerator = require('../contentGeneration/textGenerator');
const imageGenerator = require('../contentGeneration/imageGenerator');
const videoGenerator = require('../contentGeneration/videoGenerator');
const voiceGenerator = require('../contentGeneration/voiceGenerator');

// Initialize queues
let videoQueue = null;
let contentQueue = null;

/**
 * Initialize Redis queues
 */
function initQueues() {
  if (!videoQueue) {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined
    };

    try {
      videoQueue = new Queue('video-generation', { redis: redisConfig });
      contentQueue = new Queue('content-generation', { redis: redisConfig });

      // Process video generation jobs
      videoQueue.process(async (job) => {
        return await processVideoJob(job);
      });

      // Process complete content generation jobs
      contentQueue.process(async (job) => {
        return await processContentJob(job);
      });

      logger.info('Job queues initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize queues:', error);
    }
  }

  return { videoQueue, contentQueue };
}

/**
 * Process video generation job
 */
async function processVideoJob(job) {
  try {
    logger.info(`Processing video job ${job.id}`);
    
    const { script, images, voiceover, music, duration } = job.data;

    // Update progress
    await job.progress(10);

    // Generate voiceover if script provided
    let audioFile = null;
    if (script && voiceover !== false) {
      audioFile = await voiceGenerator.generate({
        text: script,
        voice: 'default',
        language: 'en',
        speed: 1.0
      });
      await job.progress(40);
    }

    // Generate video
    const video = await videoGenerator.generate({
      images: images || [],
      audio: audioFile,
      duration: duration || 60,
      transitions: true
    });

    await job.progress(100);

    logger.info(`Video job ${job.id} completed successfully`);

    return {
      jobId: job.id,
      status: 'completed',
      result: video
    };
  } catch (error) {
    logger.error(`Error processing video job ${job.id}:`, error);
    throw error;
  }
}

/**
 * Process complete content generation job
 */
async function processContentJob(job) {
  try {
    logger.info(`Processing content job ${job.id}`);
    
    const { topic, contentTypes, language } = job.data;
    const results = {};

    // Update progress
    await job.progress(10);

    // Generate text content
    if (contentTypes.includes('text')) {
      results.text = await textGenerator.generate({
        type: 'blog',
        topic,
        tone: 'professional',
        length: 'medium',
        language
      });
      await job.progress(30);
    }

    // Generate images
    if (contentTypes.includes('image')) {
      results.images = await imageGenerator.generate({
        prompt: `Professional image for: ${topic}`,
        style: 'realistic',
        size: '1024x1024',
        count: 3
      });
      await job.progress(60);
    }

    // Generate video
    if (contentTypes.includes('video')) {
      const script = results.text ? results.text.content : topic;
      const images = results.images || [];

      const audio = await voiceGenerator.generate({
        text: script.substring(0, 500),
        voice: 'default',
        language
      });

      results.video = await videoGenerator.generate({
        images,
        audio,
        duration: 60
      });
      await job.progress(90);
    }

    await job.progress(100);

    logger.info(`Content job ${job.id} completed successfully`);

    return {
      jobId: job.id,
      status: 'completed',
      topic,
      results
    };
  } catch (error) {
    logger.error(`Error processing content job ${job.id}:`, error);
    throw error;
  }
}

/**
 * Content queue manager
 */
const contentQueueManager = {
  /**
   * Add video generation job
   */
  async addVideoJob(data) {
    const queues = initQueues();
    
    if (!queues.videoQueue) {
      // Fallback: process immediately without queue
      logger.warn('Queue not available, processing synchronously');
      const result = await processVideoJob({ id: 'sync', data });
      return { id: 'sync', ...result };
    }

    const job = await queues.videoQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: true
    });

    logger.info(`Video job ${job.id} added to queue`);

    return job;
  },

  /**
   * Add complete content generation job
   */
  async addCompleteContentJob(data) {
    const queues = initQueues();
    
    if (!queues.contentQueue) {
      // Fallback: process immediately without queue
      logger.warn('Queue not available, processing synchronously');
      const result = await processContentJob({ id: 'sync', data });
      return { id: 'sync', ...result };
    }

    const job = await queues.contentQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: true
    });

    logger.info(`Content job ${job.id} added to queue`);

    return job;
  },

  /**
   * Get job status
   */
  async getJobStatus(jobId) {
    const queues = initQueues();
    
    // Try video queue first
    if (queues.videoQueue) {
      let job = await queues.videoQueue.getJob(jobId);
      if (job) {
        return await this.formatJobStatus(job);
      }
    }

    // Try content queue
    if (queues.contentQueue) {
      let job = await queues.contentQueue.getJob(jobId);
      if (job) {
        return await this.formatJobStatus(job);
      }
    }

    // Job not found
    return {
      jobId,
      status: 'not_found',
      message: 'Job not found in any queue'
    };
  },

  /**
   * Format job status response
   */
  async formatJobStatus(job) {
    const state = await job.getState();
    const progress = job._progress;
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return {
      jobId: job.id,
      status: state,
      progress,
      result,
      error: failedReason,
      createdAt: job.timestamp,
      processedAt: job.processedOn,
      finishedAt: job.finishedOn
    };
  },

  /**
   * Clean up old jobs
   */
  async cleanup(age = 24 * 60 * 60 * 1000) {
    const queues = initQueues();
    
    if (queues.videoQueue) {
      await queues.videoQueue.clean(age, 'completed');
      await queues.videoQueue.clean(age, 'failed');
    }

    if (queues.contentQueue) {
      await queues.contentQueue.clean(age, 'completed');
      await queues.contentQueue.clean(age, 'failed');
    }

    logger.info('Job cleanup completed');
  }
};

module.exports = contentQueueManager;
