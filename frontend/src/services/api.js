import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Trend Detection APIs
export const trendAPI = {
  getAllTrends: (params) => api.get('/trends/trends', { params }),
  getTwitterTrends: (params) => api.get('/trends/trends/twitter', { params }),
  getRedditTrends: (params) => api.get('/trends/trends/reddit', { params }),
  getYouTubeTrends: (params) => api.get('/trends/trends/youtube', { params }),
  getGoogleTrends: (params) => api.get('/trends/trends/google', { params }),
  analyzeTrends: (trends) => api.post('/trends/trends/analyze', { trends }),
};

// Content Generation APIs
export const contentAPI = {
  generateText: (data) => api.post('/content/generate/text', data),
  generateImage: (data) => api.post('/content/generate/image', data),
  generateVoiceover: (data) => api.post('/content/generate/voiceover', data),
  generateScript: (data) => api.post('/content/generate/script', data),
  generatePackage: (data) => api.post('/content/generate/package', data),
  translateContent: (data) => api.post('/content/translate', data),
  filterContent: (data) => api.post('/content/filter', data),
};

// Health Check API
export const healthAPI = {
  check: () => api.get('/health'),
  detailedCheck: () => api.get('/health/detailed'),
};

export default api;
