const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  trendId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'trends',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false // blog, tweet, script, image, video, audio
  },
  content: {
    type: DataTypes.TEXT
  },
  url: {
    type: DataTypes.STRING
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'draft' // draft, published, archived
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en'
  },
  safetyCheck: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'contents',
  timestamps: true,
  indexes: [
    { fields: ['trendId'] },
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Content;
