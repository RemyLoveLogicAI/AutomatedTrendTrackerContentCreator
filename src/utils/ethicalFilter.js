const logger = require('../services/logger');

/**
 * Ethical AI content filter
 * Screens content for harmful, offensive, or inappropriate material
 */
const ethicalFilter = {
  /**
   * List of prohibited content categories
   */
  prohibitedCategories: [
    'violence',
    'hate_speech',
    'explicit_content',
    'misinformation',
    'harassment',
    'illegal_activities'
  ],

  /**
   * Prohibited keywords and patterns
   */
  prohibitedKeywords: [
    // Violence
    'kill', 'murder', 'weapon', 'bomb',
    // Hate speech
    'racist', 'sexist', 'discrimination',
    // Explicit content
    'explicit', 'nsfw',
    // Add more as needed
  ],

  /**
   * Check if content passes ethical filters
   * @param {string} content - Content to check
   * @param {string} type - Content type (text, image, video)
   * @returns {Object} Filter result
   */
  async checkContent(content, type = 'text') {
    try {
      if (!process.env.ENABLE_ETHICAL_FILTERS || process.env.ENABLE_ETHICAL_FILTERS !== 'true') {
        return { passed: true, message: 'Filters disabled' };
      }

      const checks = [
        this.checkKeywords(content),
        this.checkLength(content, type),
        this.checkSafety(content)
      ];

      const results = await Promise.all(checks);
      const failed = results.filter(r => !r.passed);

      if (failed.length > 0) {
        logger.warn('Content failed ethical filters:', failed);
        return {
          passed: false,
          reasons: failed.map(f => f.reason),
          message: 'Content does not meet ethical guidelines'
        };
      }

      return {
        passed: true,
        message: 'Content passed all ethical checks'
      };
    } catch (error) {
      logger.error('Error in ethical filter:', error);
      // Fail safe - reject if filter errors
      return {
        passed: false,
        reasons: ['Filter error'],
        message: 'Unable to verify content safety'
      };
    }
  },

  /**
   * Check for prohibited keywords
   */
  checkKeywords(content) {
    const lowerContent = content.toLowerCase();
    const found = this.prohibitedKeywords.filter(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    );

    if (found.length > 0) {
      return {
        passed: false,
        reason: `Contains prohibited keywords: ${found.join(', ')}`
      };
    }

    return { passed: true };
  },

  /**
   * Check content length
   */
  checkLength(content, type) {
    const maxLengths = {
      text: 10000,
      tweet: 280,
      image_prompt: 1000
    };

    const maxLength = maxLengths[type] || maxLengths.text;

    if (content.length > maxLength) {
      return {
        passed: false,
        reason: `Content exceeds maximum length of ${maxLength} characters`
      };
    }

    return { passed: true };
  },

  /**
   * Advanced safety check
   * In production, this could use ML models for content classification
   */
  async checkSafety(content) {
    // Basic safety checks
    const suspiciousPatterns = [
      /\b(hack|exploit|crack)\b/gi,
      /\b(scam|fraud|phishing)\b/gi,
      /\b(illegal|unlawful)\b/gi
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        return {
          passed: false,
          reason: 'Content contains potentially unsafe patterns'
        };
      }
    }

    return { passed: true };
  },

  /**
   * Sanitize content by removing prohibited elements
   */
  sanitizeContent(content) {
    let sanitized = content;

    // Remove URLs that might be malicious
    sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL removed]');

    // Remove email addresses
    sanitized = sanitized.replace(/\S+@\S+\.\S+/g, '[Email removed]');

    // Remove phone numbers
    sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[Phone removed]');

    return sanitized;
  },

  /**
   * Get content safety score (0-100)
   */
  async getSafetyScore(content) {
    try {
      let score = 100;

      // Deduct points for various factors
      if (this.checkKeywords(content).passed === false) score -= 50;
      if ((await this.checkSafety(content)).passed === false) score -= 30;

      // Length check
      if (content.length < 10) score -= 10;
      if (content.length > 5000) score -= 10;

      return Math.max(0, score);
    } catch (error) {
      logger.error('Error calculating safety score:', error);
      return 0;
    }
  }
};

module.exports = ethicalFilter;
