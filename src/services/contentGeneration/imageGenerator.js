const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../logger');

let openai = null;

/**
 * Initialize OpenAI client for DALL-E
 */
function initClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    try {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    } catch (error) {
      logger.error('Failed to initialize OpenAI client:', error);
    }
  }
  return openai;
}

/**
 * Image generation service using DALL-E or Stable Diffusion
 */
const imageGenerator = {
  /**
   * Generate images using AI
   */
  async generate({ prompt, style, size, count }) {
    try {
      // Check if feature is enabled
      if (process.env.ENABLE_IMAGE_GENERATION !== 'true') {
        logger.warn('Image generation is disabled');
        return this.getMockImages(count);
      }

      // Try DALL-E first
      const images = await this.generateWithDALLE(prompt, size, count);
      
      if (images && images.length > 0) {
        return images;
      }

      // Fallback to Stable Diffusion if configured
      if (process.env.STABILITY_AI_API_KEY) {
        return await this.generateWithStableDiffusion(prompt, style, count);
      }

      // Return mock images as last resort
      return this.getMockImages(count);
    } catch (error) {
      logger.error('Error generating images:', error);
      return this.getMockImages(count);
    }
  },

  /**
   * Generate images using DALL-E
   */
  async generateWithDALLE(prompt, size, count) {
    try {
      const client = initClient();
      
      if (!client) {
        logger.warn('OpenAI client not available');
        return null;
      }

      logger.info(`Generating ${count} image(s) with DALL-E: ${prompt}`);

      const response = await client.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: Math.min(count, 1), // DALL-E 3 only supports n=1
        size: size === '1024x1024' ? '1024x1024' : '1024x1024',
        quality: 'standard'
      });

      const images = [];
      const outputDir = path.join(__dirname, '../../../generated/images');
      await fs.mkdir(outputDir, { recursive: true });

      for (const image of response.data) {
        const filename = `dalle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
        const filepath = path.join(outputDir, filename);

        // Download and save image
        const imageResponse = await axios.get(image.url, { responseType: 'arraybuffer' });
        await fs.writeFile(filepath, imageResponse.data);

        images.push({
          url: `/generated/images/${filename}`,
          prompt: image.revised_prompt || prompt,
          model: 'dall-e-3',
          size,
          filepath
        });
      }

      return images;
    } catch (error) {
      logger.error('Error generating with DALL-E:', error);
      return null;
    }
  },

  /**
   * Generate images using Stable Diffusion
   */
  async generateWithStableDiffusion(prompt, style, count) {
    try {
      if (!process.env.STABILITY_AI_API_KEY) {
        return null;
      }

      logger.info(`Generating ${count} image(s) with Stable Diffusion: ${prompt}`);

      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        {
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: count,
          steps: 30,
          style_preset: style || 'photographic'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.STABILITY_AI_API_KEY}`
          }
        }
      );

      const images = [];
      const outputDir = path.join(__dirname, '../../../generated/images');
      await fs.mkdir(outputDir, { recursive: true });

      for (const artifact of response.data.artifacts) {
        const filename = `sd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
        const filepath = path.join(outputDir, filename);

        // Decode base64 and save
        const imageBuffer = Buffer.from(artifact.base64, 'base64');
        await fs.writeFile(filepath, imageBuffer);

        images.push({
          url: `/generated/images/${filename}`,
          prompt,
          model: 'stable-diffusion-xl',
          style,
          filepath
        });
      }

      return images;
    } catch (error) {
      logger.error('Error generating with Stable Diffusion:', error);
      return null;
    }
  },

  /**
   * Create variations of an existing image
   */
  async createVariations(imagePath, count = 3) {
    try {
      const client = initClient();
      
      if (!client) {
        return this.getMockImages(count);
      }

      const response = await client.images.createVariation({
        image: await fs.readFile(imagePath),
        n: count,
        size: '1024x1024'
      });

      const images = [];
      const outputDir = path.join(__dirname, '../../../generated/images');

      for (const image of response.data) {
        const filename = `variation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
        const filepath = path.join(outputDir, filename);

        const imageResponse = await axios.get(image.url, { responseType: 'arraybuffer' });
        await fs.writeFile(filepath, imageResponse.data);

        images.push({
          url: `/generated/images/${filename}`,
          model: 'dall-e',
          type: 'variation',
          filepath
        });
      }

      return images;
    } catch (error) {
      logger.error('Error creating image variations:', error);
      throw error;
    }
  },

  /**
   * Mock images for fallback
   */
  getMockImages(count) {
    const mockImages = [];
    
    for (let i = 0; i < count; i++) {
      mockImages.push({
        url: `https://via.placeholder.com/1024x1024?text=Mock+Image+${i + 1}`,
        prompt: 'Mock image placeholder',
        model: 'mock',
        size: '1024x1024'
      });
    }

    return mockImages;
  }
};

module.exports = imageGenerator;
