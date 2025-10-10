const request = require('supertest');
const app = require('../src/index');

describe('API Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/trends', () => {
    it('should return trends from all sources', async () => {
      const response = await request(app)
        .get('/api/trends?limit=5')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter trends by source', async () => {
      const response = await request(app)
        .get('/api/trends?source=twitter&limit=5')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.metadata.sources).toBe('twitter');
    });
  });

  describe('POST /api/content/text', () => {
    it('should generate text content', async () => {
      const response = await request(app)
        .post('/api/content/text')
        .send({
          topic: 'Test Topic',
          type: 'blog',
          tone: 'professional',
          length: 'short'
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('content');
    });

    it('should require topic parameter', async () => {
      const response = await request(app)
        .post('/api/content/text')
        .send({
          type: 'blog'
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });
});

describe('Services', () => {
  describe('Ethical Filter', () => {
    const ethicalFilter = require('../src/utils/ethicalFilter');

    it('should pass clean content', async () => {
      const result = await ethicalFilter.checkContent('This is clean content about technology');
      expect(result.passed).toBe(true);
    });

    it('should calculate safety score', async () => {
      const score = await ethicalFilter.getSafetyScore('Clean content');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
