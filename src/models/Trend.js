const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Trend = sequelize.define('Trend', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false
  },
  popularity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  url: {
    type: DataTypes.STRING
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  nlpScore: {
    type: DataTypes.FLOAT
  },
  sentiment: {
    type: DataTypes.STRING
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en'
  }
}, {
  tableName: 'trends',
  timestamps: true,
  indexes: [
    { fields: ['source'] },
    { fields: ['popularity'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Trend;
