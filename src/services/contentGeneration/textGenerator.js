const OpenAI = require('openai');
const logger = require('../logger');

let openai = null;

/**
 * Initialize OpenAI client
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
 * Text generation service using OpenAI GPT
 */
const textGenerator = {
  /**
   * Generate text content
   */
  async generate({ type, topic, tone, length, language }) {
    try {
      const client = initClient();
      
      if (!client) {
        logger.warn('OpenAI client not available, returning mock content');
        return this.getMockContent(type, topic);
      }

      const prompt = this.buildPrompt(type, topic, tone, length, language);
      const maxTokens = this.getMaxTokens(length);

      logger.info(`Generating ${type} content for topic: ${topic}`);

      const completion = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional content creator specializing in ${type} content. Generate high-quality, engaging content in ${language}.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      });

      const content = completion.choices[0].message.content;

      return {
        type,
        topic,
        content,
        metadata: {
          tone,
          length,
          language,
          wordCount: content.split(' ').length,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Error generating text content:', error);
      return this.getMockContent(type, topic);
    }
  },

  /**
   * Build prompt based on content type
   */
  buildPrompt(type, topic, tone, length, language) {
    const prompts = {
      blog: `Write a ${length} ${tone} blog post about "${topic}". Include an engaging introduction, well-structured body paragraphs, and a compelling conclusion. Use proper headings and make it SEO-friendly.`,
      
      tweet: `Create a ${tone} tweet about "${topic}". Keep it under 280 characters, make it engaging and shareable. Include relevant hashtags.`,
      
      script: `Write a ${length} video script about "${topic}" in a ${tone} tone. Include an attention-grabbing hook, clear structure, and call-to-action.`,
      
      article: `Write a ${length} ${tone} article about "${topic}". Make it informative, well-researched, and engaging for readers.`,
      
      description: `Write a compelling ${length} description for "${topic}" in a ${tone} tone. Make it clear, concise, and persuasive.`,
      
      social: `Create ${tone} social media content about "${topic}". Make it engaging, shareable, and platform-appropriate.`
    };

    return prompts[type] || prompts.article;
  },

  /**
   * Get max tokens based on length
   */
  getMaxTokens(length) {
    const tokenMap = {
      short: 300,
      medium: 600,
      long: 1200,
      verylong: 2000
    };

    return tokenMap[length] || 600;
  },

  /**
   * Generate multiple variations
   */
  async generateVariations(options, count = 3) {
    try {
      const variations = [];
      
      for (let i = 0; i < count; i++) {
        const content = await this.generate(options);
        variations.push(content);
      }

      return variations;
    } catch (error) {
      logger.error('Error generating variations:', error);
      throw error;
    }
  },

  /**
   * Improve existing content
   */
  async improveContent(content, instructions) {
    try {
      const client = initClient();
      
      if (!client) {
        return { improved: content, suggestions: [] };
      }

      const completion = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content editor. Improve the given content based on the instructions provided.'
          },
          {
            role: 'user',
            content: `Content:\n${content}\n\nInstructions:\n${instructions}\n\nProvide the improved version.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      return {
        original: content,
        improved: completion.choices[0].message.content,
        instructions
      };
    } catch (error) {
      logger.error('Error improving content:', error);
      throw error;
    }
  },

  /**
   * Mock content for fallback
   */
  getMockContent(type, topic) {
    return {
      type,
      topic,
      content: `This is mock ${type} content about ${topic}. In a production environment with valid API keys, this would be generated using OpenAI GPT models.`,
      metadata: {
        tone: 'professional',
        length: 'medium',
        language: 'en',
        wordCount: 25,
        generatedAt: new Date().toISOString()
      }
    };
  }
};

module.exports = textGenerator;
