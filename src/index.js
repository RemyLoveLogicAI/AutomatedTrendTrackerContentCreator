const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const trendDetectionRoutes = require('./api/trendDetection');
const contentGenerationRoutes = require('./api/contentGeneration');
const healthRoutes = require('./api/health');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Import services
const logger = require('./services/logger');
const database = require('./config/database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Serve static files (for generated content)
app.use('/generated', express.static(path.join(__dirname, '../generated')));

// API Routes
app.use('/api/trends', trendDetectionRoutes);
app.use('/api/content', contentGenerationRoutes);
app.use('/api/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Automated Trend Tracker & Content Creator API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      trends: '/api/trends',
      content: '/api/content',
      health: '/api/health'
    }
  });
});

// Error handling
app.use(errorHandler);

// Database connection
database.connect()
  .then(() => {
    logger.info('Database connected successfully');
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    logger.error('Database connection failed:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  database.disconnect();
  process.exit(0);
});

module.exports = app;
