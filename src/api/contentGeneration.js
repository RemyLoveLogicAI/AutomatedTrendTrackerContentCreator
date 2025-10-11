const express = require('express');
const router = express.Router();
const contentService = require('../services/contentService');
const logger = require('../utils/logger');

// Generate text content (blog, tweet, script)
router.post('/generate/text', async (req, res) => {
  try {
    const { prompt, type = 'blog', maxTokens = 500, temperature = 0.7 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    logger.info(`Generating ${type} content for prompt: ${prompt.substring(0, 50)}...`);
    
    const content = await contentService.generateText({
      prompt,
      type,
      maxTokens,
      temperature
    });
    
    res.json({
      success: true,
      type: type,
      data: content
    });
  } catch (error) {
    logger.error('Error generating text:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate image from text description
router.post('/generate/image', async (req, res) => {
  try {
    const { prompt, size = '1024x1024', n = 1 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    logger.info(`Generating image for prompt: ${prompt.substring(0, 50)}...`);
    
    const images = await contentService.generateImage({
      prompt,
      size,
      n
    });
    
    res.json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    logger.error('Error generating image:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate voiceover from text
router.post('/generate/voiceover', async (req, res) => {
  try {
    const { text, voice = 'en-US-Neural2-C', language = 'en-US' } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    logger.info(`Generating voiceover for text: ${text.substring(0, 50)}...`);
    
    const audio = await contentService.generateVoiceover({
      text,
      voice,
      language
    });
    
    res.json({
      success: true,
      data: audio
    });
  } catch (error) {
    logger.error('Error generating voiceover:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate video script from trend
router.post('/generate/script', async (req, res) => {
  try {
    const { trend, duration = '60s', style = 'informative' } = req.body;
    
    if (!trend) {
      return res.status(400).json({
        success: false,
        error: 'Trend topic is required'
      });
    }

    logger.info(`Generating script for trend: ${trend}`);
    
    const script = await contentService.generateVideoScript({
      trend,
      duration,
      style
    });
    
    res.json({
      success: true,
      data: script
    });
  } catch (error) {
    logger.error('Error generating script:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create complete content package from trend
router.post('/generate/package', async (req, res) => {
  try {
    const { 
      trend, 
      includeText = true, 
      includeImage = true, 
      includeVoiceover = false,
      contentTypes = ['tweet', 'blog']
    } = req.body;
    
    if (!trend) {
      return res.status(400).json({
        success: false,
        error: 'Trend topic is required'
      });
    }

    logger.info(`Generating content package for trend: ${trend}`);
    
    const contentPackage = await contentService.generateContentPackage({
      trend,
      includeText,
      includeImage,
      includeVoiceover,
      contentTypes
    });
    
    res.json({
      success: true,
      data: contentPackage
    });
  } catch (error) {
    logger.error('Error generating content package:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Translate content to multiple languages
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguages = ['es', 'fr', 'de'] } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    logger.info(`Translating text to ${targetLanguages.length} languages`);
    
    const translations = await contentService.translateContent({
      text,
      targetLanguages
    });
    
    res.json({
      success: true,
      languages: targetLanguages.length,
      data: translations
    });
  } catch (error) {
    logger.error('Error translating content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Filter content for ethical AI compliance
router.post('/filter', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }

    logger.info('Filtering content for safety');
    
    const result = await contentService.filterContent(content);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error filtering content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
