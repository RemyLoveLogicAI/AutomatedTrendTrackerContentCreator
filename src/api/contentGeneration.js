const express = require('express');
const router = express.Router();
const textGenerator = require('../services/contentGeneration/textGenerator');
const imageGenerator = require('../services/contentGeneration/imageGenerator');
const videoGenerator = require('../services/contentGeneration/videoGenerator');
const voiceGenerator = require('../services/contentGeneration/voiceGenerator');
const contentQueue = require('../services/queue/contentQueue');
const logger = require('../services/logger');

/**
 * POST /api/content/text
 * Generate text content (blog, tweet, script, etc.)
 */
router.post('/text', async (req, res, next) => {
  try {
    const { type, topic, tone, length, language = 'en' } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    logger.info(`Generating ${type || 'text'} content for topic: ${topic}`);

    const content = await textGenerator.generate({
      type: type || 'blog',
      topic,
      tone: tone || 'professional',
      length: length || 'medium',
      language
    });

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    logger.error('Error generating text content:', error);
    next(error);
  }
});

/**
 * POST /api/content/image
 * Generate images using AI
 */
router.post('/image', async (req, res, next) => {
  try {
    const { prompt, style, size = '1024x1024', count = 1 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    logger.info(`Generating image with prompt: ${prompt}`);

    const images = await imageGenerator.generate({
      prompt,
      style: style || 'realistic',
      size,
      count
    });

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    logger.error('Error generating image:', error);
    next(error);
  }
});

/**
 * POST /api/content/video
 * Generate video content (queued job)
 */
router.post('/video', async (req, res, next) => {
  try {
    const { script, images, voiceover, music, duration } = req.body;

    if (!script && !images) {
      return res.status(400).json({
        success: false,
        error: 'Either script or images are required'
      });
    }

    logger.info('Queueing video generation job');

    // Queue the video generation job
    const job = await contentQueue.addVideoJob({
      script,
      images,
      voiceover,
      music,
      duration: duration || 60
    });

    res.json({
      success: true,
      data: {
        jobId: job.id,
        status: 'queued',
        message: 'Video generation started. Check status at /api/content/status/:jobId'
      }
    });
  } catch (error) {
    logger.error('Error queueing video generation:', error);
    next(error);
  }
});

/**
 * POST /api/content/voice
 * Generate voiceover from text
 */
router.post('/voice', async (req, res, next) => {
  try {
    const { text, voice = 'default', language = 'en', speed = 1.0 } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    logger.info(`Generating voiceover for ${text.length} characters`);

    const audio = await voiceGenerator.generate({
      text,
      voice,
      language,
      speed
    });

    res.json({
      success: true,
      data: audio
    });
  } catch (error) {
    logger.error('Error generating voiceover:', error);
    next(error);
  }
});

/**
 * POST /api/content/complete
 * Generate complete content package (text, image, video)
 */
router.post('/complete', async (req, res, next) => {
  try {
    const { topic, contentTypes = ['text', 'image'], language = 'en' } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    logger.info(`Generating complete content package for: ${topic}`);

    // Queue the complete content generation job
    const job = await contentQueue.addCompleteContentJob({
      topic,
      contentTypes,
      language
    });

    res.json({
      success: true,
      data: {
        jobId: job.id,
        status: 'queued',
        message: 'Content generation started. Check status at /api/content/status/:jobId'
      }
    });
  } catch (error) {
    logger.error('Error queueing complete content generation:', error);
    next(error);
  }
});

/**
 * GET /api/content/status/:jobId
 * Check status of a content generation job
 */
router.get('/status/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params;

    logger.info(`Checking status for job: ${jobId}`);

    const status = await contentQueue.getJobStatus(jobId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error checking job status:', error);
    next(error);
  }
});

module.exports = router;
