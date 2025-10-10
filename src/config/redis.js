const redis = require('redis');
const logger = require('../services/logger');

let client = null;

/**
 * Redis configuration object
 */
const redisConfig = {
  /**
   * Initialize Redis client
   */
  async connect() {
    try {
      client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis connection refused');
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      client.on('error', (err) => {
        logger.error('Redis client error:', err);
      });

      client.on('connect', () => {
        logger.info('Redis connected successfully');
      });

      await client.connect();
      return client;
    } catch (error) {
      logger.error('Redis connection error:', error);
      // Don't throw error to allow app to run without Redis
      return null;
    }
  },

  /**
   * Get Redis client
   */
  getClient() {
    return client;
  },

  /**
   * Ping Redis to check connection
   */
  async ping() {
    if (!client) {
      throw new Error('Redis client not connected');
    }
    return await client.ping();
  },

  /**
   * Disconnect Redis client
   */
  async disconnect() {
    if (client) {
      await client.quit();
      logger.info('Redis disconnected');
    }
  }
};

module.exports = redisConfig;
