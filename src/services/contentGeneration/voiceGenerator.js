const gTTS = require('gtts');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../logger');

/**
 * Voice generation service using Google TTS and ElevenLabs
 */
const voiceGenerator = {
  /**
   * Generate voiceover from text
   */
  async generate({ text, voice, language, speed }) {
    try {
      // Check if feature is enabled
      if (process.env.ENABLE_VOICE_GENERATION !== 'true') {
        logger.warn('Voice generation is disabled');
        return this.getMockVoice();
      }

      // Try ElevenLabs first if configured
      if (process.env.ELEVENLABS_API_KEY) {
        const result = await this.generateWithElevenLabs(text, voice);
        if (result) return result;
      }

      // Fallback to Google TTS
      return await this.generateWithGoogleTTS(text, language, speed);
    } catch (error) {
      logger.error('Error generating voiceover:', error);
      return this.getMockVoice();
    }
  },

  /**
   * Generate voiceover using ElevenLabs
   */
  async generateWithElevenLabs(text, voice) {
    try {
      if (!process.env.ELEVENLABS_API_KEY) {
        return null;
      }

      logger.info('Generating voiceover with ElevenLabs');

      // Default voice ID (Rachel)
      const voiceId = voice || '21m00Tcm4TlvDq8ikWAM';

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      const outputDir = path.join(__dirname, '../../../generated/audio');
      await fs.mkdir(outputDir, { recursive: true });

      const filename = `elevenlabs_${Date.now()}.mp3`;
      const filepath = path.join(outputDir, filename);

      await fs.writeFile(filepath, response.data);

      logger.info(`ElevenLabs voiceover generated: ${filepath}`);

      return {
        url: `/generated/audio/${filename}`,
        filepath,
        format: 'mp3',
        provider: 'elevenlabs',
        voice: voiceId,
        duration: null // Would need audio analysis to determine
      };
    } catch (error) {
      logger.error('Error generating with ElevenLabs:', error);
      return null;
    }
  },

  /**
   * Generate voiceover using Google TTS
   */
  async generateWithGoogleTTS(text, language, speed) {
    return new Promise((resolve, reject) => {
      try {
        logger.info('Generating voiceover with Google TTS');

        const gtts = new gTTS(text, language || 'en');
        
        const outputDir = path.join(__dirname, '../../../generated/audio');
        fs.mkdir(outputDir, { recursive: true }).then(() => {
          const filename = `gtts_${Date.now()}.mp3`;
          const filepath = path.join(outputDir, filename);

          gtts.save(filepath, (err) => {
            if (err) {
              logger.error('Error saving Google TTS audio:', err);
              reject(err);
              return;
            }

            logger.info(`Google TTS voiceover generated: ${filepath}`);

            resolve({
              url: `/generated/audio/${filename}`,
              filepath,
              format: 'mp3',
              provider: 'google-tts',
              language: language || 'en',
              speed: speed || 1.0
            });
          });
        });
      } catch (error) {
        logger.error('Error generating with Google TTS:', error);
        reject(error);
      }
    });
  },

  /**
   * List available voices
   */
  async listVoices() {
    try {
      if (!process.env.ELEVENLABS_API_KEY) {
        return this.getDefaultVoices();
      }

      const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        }
      });

      return response.data.voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        description: voice.description || ''
      }));
    } catch (error) {
      logger.error('Error listing voices:', error);
      return this.getDefaultVoices();
    }
  },

  /**
   * Get default voice options
   */
  getDefaultVoices() {
    return [
      { id: 'default', name: 'Default', category: 'general', description: 'Default voice' },
      { id: 'en-US', name: 'English (US)', category: 'language', description: 'American English' },
      { id: 'en-GB', name: 'English (UK)', category: 'language', description: 'British English' },
      { id: 'es-ES', name: 'Spanish', category: 'language', description: 'Spanish voice' },
      { id: 'fr-FR', name: 'French', category: 'language', description: 'French voice' }
    ];
  },

  /**
   * Mock voice for fallback
   */
  getMockVoice() {
    return {
      url: '/generated/audio/mock_voice.mp3',
      filepath: '/tmp/mock_voice.mp3',
      format: 'mp3',
      provider: 'mock',
      mock: true
    };
  }
};

module.exports = voiceGenerator;
