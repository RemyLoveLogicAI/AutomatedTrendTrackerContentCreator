const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// PostgreSQL configuration
const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'trend_tracker',
  process.env.POSTGRES_USER || 'postgres',
  process.env.POSTGRES_PASSWORD || 'password',
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to PostgreSQL:', error);
  }
};

module.exports = { sequelize, testConnection };
