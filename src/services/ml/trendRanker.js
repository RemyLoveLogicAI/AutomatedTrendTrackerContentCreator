const { HfInference } = require('@huggingface/inference');
const logger = require('../logger');

let hf = null;

/**
 * Initialize Hugging Face client
 */
function initClient() {
  if (!hf && process.env.HUGGINGFACE_API_KEY) {
    try {
      hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    } catch (error) {
      logger.error('Failed to initialize Hugging Face client:', error);
    }
  }
  return hf;
}

/**
 * ML-based trend ranking service
 */
const trendRanker = {
  /**
   * Rank trends using ML-based analysis
   */
  async rankTrends(trends) {
    try {
      logger.info(`Ranking ${trends.length} trends using ML analysis`);

      // Calculate composite score for each trend
      const scoredTrends = await Promise.all(
        trends.map(async (trend) => {
          const score = await this.calculateTrendScore(trend);
          return {
            ...trend,
            mlScore: score,
            compositeScore: this.calculateCompositeScore(trend, score)
          };
        })
      );

      // Sort by composite score (descending)
      scoredTrends.sort((a, b) => b.compositeScore - a.compositeScore);

      return scoredTrends;
    } catch (error) {
      logger.error('Error ranking trends:', error);
      // Fallback to simple popularity sorting
      return trends.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
  },

  /**
   * Calculate ML-based trend score
   */
  async calculateTrendScore(trend) {
    try {
      const client = initClient();
      
      if (!client) {
        // Fallback to basic scoring
        return this.getBasicScore(trend);
      }

      // Use sentiment analysis to gauge trend sentiment
      const sentiment = await this.analyzeSentiment(trend.topic + ' ' + (trend.description || ''));
      
      // Use zero-shot classification to categorize trend
      const category = await this.categorize(trend.topic);

      // Calculate score based on multiple factors
      let score = 50; // Base score

      // Sentiment factor (positive sentiment increases score)
      if (sentiment === 'POSITIVE') score += 20;
      else if (sentiment === 'NEGATIVE') score -= 10;

      // Category factor (certain categories are more valuable)
      const highValueCategories = ['technology', 'business', 'innovation', 'science'];
      if (highValueCategories.some(cat => category.toLowerCase().includes(cat))) {
        score += 15;
      }

      // Engagement factor
      if (trend.comments && trend.comments > 100) score += 10;
      if (trend.views && trend.views > 100000) score += 10;

      return Math.min(100, Math.max(0, score));
    } catch (error) {
      logger.error('Error calculating ML score:', error);
      return this.getBasicScore(trend);
    }
  },

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text) {
    try {
      const client = initClient();
      
      if (!client) {
        return 'NEUTRAL';
      }

      const result = await client.textClassification({
        model: 'distilbert-base-uncased-finetuned-sst-2-english',
        inputs: text.substring(0, 512) // Limit to model's max length
      });

      return result[0].label;
    } catch (error) {
      logger.debug('Sentiment analysis error:', error);
      return 'NEUTRAL';
    }
  },

  /**
   * Categorize trend topic
   */
  async categorize(topic) {
    try {
      const client = initClient();
      
      if (!client) {
        return 'general';
      }

      const categories = [
        'technology',
        'business',
        'entertainment',
        'sports',
        'politics',
        'science',
        'health',
        'lifestyle'
      ];

      const result = await client.zeroShotClassification({
        model: 'facebook/bart-large-mnli',
        inputs: topic,
        parameters: { candidate_labels: categories }
      });

      return result.labels[0];
    } catch (error) {
      logger.debug('Categorization error:', error);
      return 'general';
    }
  },

  /**
   * Calculate composite score from multiple factors
   */
  calculateCompositeScore(trend, mlScore) {
    const popularityWeight = 0.4;
    const mlWeight = 0.4;
    const recencyWeight = 0.2;

    // Normalize popularity (0-100)
    const maxPopularity = 1000000;
    const normalizedPopularity = Math.min(100, (trend.popularity / maxPopularity) * 100);

    // Recency score (newer is better)
    const recencyScore = 80; // Default for recent trends

    // Composite score
    const compositeScore = 
      (normalizedPopularity * popularityWeight) +
      (mlScore * mlWeight) +
      (recencyScore * recencyWeight);

    return compositeScore;
  },

  /**
   * Basic score calculation (fallback)
   */
  getBasicScore(trend) {
    let score = 50;
    
    if (trend.popularity > 50000) score += 20;
    else if (trend.popularity > 10000) score += 10;
    
    if (trend.comments && trend.comments > 100) score += 10;
    if (trend.views && trend.views > 100000) score += 10;

    return score;
  },

  /**
   * Analyze trend potential for custom text
   */
  async analyzeTrendPotential(text) {
    try {
      logger.info('Analyzing trend potential for custom text');

      const sentiment = await this.analyzeSentiment(text);
      const category = await this.categorize(text);

      // Extract key phrases using basic analysis
      const keywords = this.extractKeywords(text);

      return {
        sentiment,
        category,
        keywords,
        trendPotential: this.calculatePotentialScore(sentiment, category, keywords),
        recommendations: this.getRecommendations(sentiment, category)
      };
    } catch (error) {
      logger.error('Error analyzing trend potential:', error);
      throw error;
    }
  },

  /**
   * Extract keywords from text (simple implementation)
   */
  extractKeywords(text) {
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to']);
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = {};

    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  },

  /**
   * Calculate potential score
   */
  calculatePotentialScore(sentiment, category, keywords) {
    let score = 50;

    if (sentiment === 'POSITIVE') score += 20;
    
    const highValueCategories = ['technology', 'business', 'innovation', 'science'];
    if (highValueCategories.includes(category)) score += 20;

    if (keywords.length >= 5) score += 10;

    return Math.min(100, score);
  },

  /**
   * Get recommendations based on analysis
   */
  getRecommendations(sentiment, category) {
    const recommendations = [];

    if (sentiment === 'NEGATIVE') {
      recommendations.push('Consider reframing with a more positive angle');
    }

    recommendations.push(`This topic fits the ${category} category`);
    recommendations.push('Add trending hashtags for better reach');
    recommendations.push('Include visual content for higher engagement');

    return recommendations;
  }
};

module.exports = trendRanker;
