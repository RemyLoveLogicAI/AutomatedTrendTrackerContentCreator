const OpenAI = require('openai');
const { Translate } = require('@google-cloud/translate').v2;
const textToSpeech = require('@google-cloud/text-to-speech');
const logger = require('../utils/logger');

class ContentService {
  constructor() {
    // Initialize OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    // Initialize Google Cloud Translate
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      this.translate = new Translate();
      this.ttsClient = new textToSpeech.TextToSpeechClient();
    }
  }

  // Generate text content using OpenAI GPT
  async generateText({ prompt, type = 'blog', maxTokens = 500, temperature = 0.7 }) {
    try {
      if (!this.openai) {
        logger.warn('OpenAI API not configured, returning mock content');
        return this.getMockTextContent(type, prompt);
      }

      const systemPrompts = {
        blog: 'You are a professional blog writer. Create engaging, informative blog posts.',
        tweet: 'You are a social media expert. Create concise, engaging tweets under 280 characters.',
        script: 'You are a video script writer. Create engaging video scripts with clear narration.',
        article: 'You are a journalist. Write informative, well-structured articles.',
        description: 'You are a content writer. Create compelling descriptions.'
      };

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompts[type] || systemPrompts.blog },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      });

      return {
        content: completion.choices[0].message.content,
        type: type,
        prompt: prompt,
        metadata: {
          model: completion.model,
          tokens: completion.usage.total_tokens,
          finishReason: completion.choices[0].finish_reason
        }
      };
    } catch (error) {
      logger.error('Error generating text with OpenAI:', error);
      return this.getMockTextContent(type, prompt);
    }
  }

  // Generate image using DALL·E or similar
  async generateImage({ prompt, size = '1024x1024', n = 1 }) {
    try {
      if (!this.openai) {
        logger.warn('OpenAI API not configured, returning mock image URLs');
        return this.getMockImageData(n);
      }

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: n,
        size: size
      });

      return response.data.map((image, index) => ({
        url: image.url,
        prompt: prompt,
        size: size,
        index: index
      }));
    } catch (error) {
      logger.error('Error generating image:', error);
      return this.getMockImageData(n);
    }
  }

  // Generate voiceover using Google TTS
  async generateVoiceover({ text, voice = 'en-US-Neural2-C', language = 'en-US' }) {
    try {
      if (!this.ttsClient) {
        logger.warn('Google TTS not configured, returning mock audio data');
        return this.getMockAudioData();
      }

      const request = {
        input: { text: text },
        voice: { 
          languageCode: language,
          name: voice
        },
        audioConfig: { 
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0
        }
      };

      const [response] = await this.ttsClient.synthesizeSpeech(request);
      
      // In production, save to S3 or file system
      const audioContent = response.audioContent.toString('base64');

      return {
        audioBase64: audioContent,
        format: 'mp3',
        voice: voice,
        language: language,
        textLength: text.length
      };
    } catch (error) {
      logger.error('Error generating voiceover:', error);
      return this.getMockAudioData();
    }
  }

  // Generate video script
  async generateVideoScript({ trend, duration = '60s', style = 'informative' }) {
    const prompt = `Create a ${duration} video script about "${trend}" in an ${style} style. 
    Include:
    - Hook (5 seconds)
    - Main content
    - Call to action
    Format as a script with timestamps.`;

    const scriptContent = await this.generateText({
      prompt,
      type: 'script',
      maxTokens: 800,
      temperature: 0.8
    });

    return {
      ...scriptContent,
      trend: trend,
      duration: duration,
      style: style
    };
  }

  // Generate complete content package
  async generateContentPackage({ 
    trend, 
    includeText = true, 
    includeImage = true, 
    includeVoiceover = false,
    contentTypes = ['tweet', 'blog']
  }) {
    const contentPackage = {
      trend: trend,
      timestamp: new Date().toISOString(),
      contents: {}
    };

    try {
      // Generate text content for each type
      if (includeText) {
        const textPromises = contentTypes.map(type =>
          this.generateText({
            prompt: `Create ${type} content about trending topic: ${trend}`,
            type,
            maxTokens: type === 'tweet' ? 100 : 500
          })
        );

        const textContents = await Promise.all(textPromises);
        contentPackage.contents.text = textContents.reduce((acc, content) => {
          acc[content.type] = content;
          return acc;
        }, {});
      }

      // Generate image
      if (includeImage) {
        const images = await this.generateImage({
          prompt: `Create a visually appealing image for: ${trend}`,
          n: 1
        });
        contentPackage.contents.image = images[0];
      }

      // Generate voiceover
      if (includeVoiceover && contentPackage.contents.text?.blog) {
        const voiceover = await this.generateVoiceover({
          text: contentPackage.contents.text.blog.content.substring(0, 500)
        });
        contentPackage.contents.voiceover = voiceover;
      }

      return contentPackage;
    } catch (error) {
      logger.error('Error generating content package:', error);
      throw error;
    }
  }

  // Translate content to multiple languages
  async translateContent({ text, targetLanguages = ['es', 'fr', 'de'] }) {
    try {
      if (!this.translate) {
        logger.warn('Google Translate not configured, returning mock translations');
        return this.getMockTranslations(text, targetLanguages);
      }

      const translations = await Promise.all(
        targetLanguages.map(async (lang) => {
          try {
            const [translation] = await this.translate.translate(text, lang);
            return {
              language: lang,
              text: translation
            };
          } catch (error) {
            logger.error(`Error translating to ${lang}:`, error);
            return {
              language: lang,
              text: `[Translation to ${lang} failed]`,
              error: true
            };
          }
        })
      );

      return {
        original: text,
        translations: translations
      };
    } catch (error) {
      logger.error('Error in translation service:', error);
      return this.getMockTranslations(text, targetLanguages);
    }
  }

  // Filter content for safety and ethical compliance
  async filterContent(content) {
    try {
      // In production, use moderation API
      if (this.openai) {
        const moderation = await this.openai.moderations.create({
          input: content
        });

        const result = moderation.results[0];
        
        return {
          content: content,
          safe: !result.flagged,
          categories: result.categories,
          categoryScores: result.category_scores,
          action: result.flagged ? 'rejected' : 'approved'
        };
      }

      // Simple keyword filter as fallback
      const unsafeKeywords = ['violence', 'hate', 'explicit'];
      const containsUnsafe = unsafeKeywords.some(keyword => 
        content.toLowerCase().includes(keyword)
      );

      return {
        content: content,
        safe: !containsUnsafe,
        action: containsUnsafe ? 'rejected' : 'approved',
        note: 'Using basic keyword filter. Configure OpenAI for advanced filtering.'
      };
    } catch (error) {
      logger.error('Error filtering content:', error);
      return {
        content: content,
        safe: true,
        action: 'approved',
        note: 'Filter unavailable, content approved by default'
      };
    }
  }

  // Mock data methods for development
  getMockTextContent(type, prompt) {
    const mockContent = {
      blog: `# ${prompt}\n\nThis is a mock blog post about ${prompt}. In production, this would be generated by OpenAI GPT.\n\nConfigure your OPENAI_API_KEY to enable real content generation.`,
      tweet: `🔥 ${prompt.substring(0, 200)} #Trending #AI`,
      script: `[00:00] Hook: ${prompt}\n[00:05] Main Content: Detailed discussion about ${prompt}\n[00:55] Call to Action: Like and subscribe!`,
      article: `Mock article about ${prompt}. Configure OpenAI API to generate real content.`,
      description: `Compelling description for ${prompt}`
    };

    return {
      content: mockContent[type] || mockContent.blog,
      type: type,
      prompt: prompt,
      metadata: {
        note: 'This is mock content. Configure OPENAI_API_KEY for real generation.'
      }
    };
  }

  getMockImageData(n) {
    return Array.from({ length: n }, (_, i) => ({
      url: `https://via.placeholder.com/1024x1024?text=Mock+Image+${i + 1}`,
      prompt: 'Mock image - Configure OPENAI_API_KEY for real generation',
      size: '1024x1024',
      index: i,
      note: 'Mock data'
    }));
  }

  getMockAudioData() {
    return {
      audioBase64: 'mock_audio_data_base64',
      format: 'mp3',
      voice: 'mock-voice',
      language: 'en-US',
      note: 'Mock audio data. Configure Google Cloud TTS for real generation.'
    };
  }

  getMockTranslations(text, targetLanguages) {
    return {
      original: text,
      translations: targetLanguages.map(lang => ({
        language: lang,
        text: `[${lang}] ${text}`,
        note: 'Mock translation. Configure Google Translate API for real translations.'
      }))
    };
  }
}

module.exports = new ContentService();
