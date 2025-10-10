const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const logger = require('../services/logger');

// MongoDB connection
let mongoConnection = null;

// PostgreSQL connection
let postgresConnection = null;

/**
 * Database configuration object
 */
const database = {
  /**
   * Connect to database(s)
   */
  async connect() {
    const dbType = process.env.DATABASE_TYPE || 'mongodb';

    try {
      if (dbType === 'mongodb' || process.env.MONGODB_URI) {
        await this.connectMongoDB();
      }

      if (dbType === 'postgresql' || process.env.DATABASE_URL) {
        await this.connectPostgreSQL();
      }

      logger.info('Database connection(s) established successfully');
    } catch (error) {
      logger.error('Database connection error:', error);
      throw error;
    }
  },

  /**
   * Connect to MongoDB
   */
  async connectMongoDB() {
    if (!process.env.MONGODB_URI) {
      logger.warn('MongoDB URI not provided, skipping MongoDB connection');
      return;
    }

    try {
      mongoConnection = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      logger.info('MongoDB connected successfully');
    } catch (error) {
      logger.error('MongoDB connection error:', error);
      throw error;
    }
  },

  /**
   * Connect to PostgreSQL
   */
  async connectPostgreSQL() {
    if (!process.env.DATABASE_URL) {
      logger.warn('PostgreSQL URL not provided, skipping PostgreSQL connection');
      return;
    }

    try {
      postgresConnection = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: (msg) => logger.debug(msg),
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });

      await postgresConnection.authenticate();
      logger.info('PostgreSQL connected successfully');
    } catch (error) {
      logger.error('PostgreSQL connection error:', error);
      throw error;
    }
  },

  /**
   * Disconnect from all databases
   */
  async disconnect() {
    try {
      if (mongoConnection) {
        await mongoose.disconnect();
        logger.info('MongoDB disconnected');
      }

      if (postgresConnection) {
        await postgresConnection.close();
        logger.info('PostgreSQL disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
    }
  },

  /**
   * Ping database to check connection
   */
  async ping() {
    if (mongoConnection) {
      await mongoose.connection.db.admin().ping();
    }
    if (postgresConnection) {
      await postgresConnection.authenticate();
    }
  },

  /**
   * Get MongoDB connection
   */
  getMongo() {
    return mongoConnection;
  },

  /**
   * Get PostgreSQL connection
   */
  getPostgres() {
    return postgresConnection;
  }
};

module.exports = database;
