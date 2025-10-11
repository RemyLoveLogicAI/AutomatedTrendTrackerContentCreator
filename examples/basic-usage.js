/**
 * Example: Using the Trend Tracker API
 * 
 * This example demonstrates how to:
 * 1. Fetch trends from different sources
 * 2. Analyze trends with NLP
 * 3. Generate content based on trends
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Create API client
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function main() {
  try {
    console.log('🚀 Automated Trend Tracker - Example Usage\n');

    // 1. Fetch all trends
    console.log('1️⃣ Fetching aggregated trends from all sources...');
    const trendsResponse = await api.get('/trends/trends', {
      params: { limit: 5 }
    });
    const trends = trendsResponse.data.data;
    console.log(`✓ Found ${trends.length} trends`);
    console.log('Top trend:', trends[0]?.topic || 'None');
    console.log('');

    // 2. Fetch Twitter trends
    console.log('2️⃣ Fetching Twitter trends...');
    const twitterResponse = await api.get('/trends/trends/twitter', {
      params: { limit: 3 }
    });
    console.log(`✓ Found ${twitterResponse.data.count} Twitter trends`);
    console.log('');

    // 3. Analyze trends with NLP
    if (trends.length > 0) {
      console.log('3️⃣ Analyzing trends with NLP...');
      const analyzeResponse = await api.post('/trends/trends/analyze', {
        trends: trends.slice(0, 3)
      });
      const analyzed = analyzeResponse.data.data;
      console.log(`✓ Analyzed ${analyzed.length} trends`);
      if (analyzed.length > 0) {
        console.log('Top analyzed trend:', {
          topic: analyzed[0].topic,
          nlpScore: analyzed[0].nlpScore,
          sentiment: analyzed[0].sentiment
        });
      }
      console.log('');
    }

    // 4. Generate tweet based on top trend
    if (trends.length > 0) {
      const topTrend = trends[0];
      console.log(`4️⃣ Generating tweet about "${topTrend.topic}"...`);
      const tweetResponse = await api.post('/content/generate/text', {
        prompt: `Write an engaging tweet about: ${topTrend.topic}`,
        type: 'tweet',
        maxTokens: 100,
        temperature: 0.8
      });
      console.log('✓ Tweet generated:');
      console.log(`"${tweetResponse.data.data.content}"`);
      console.log('');
    }

    // 5. Generate blog post
    console.log('5️⃣ Generating blog post about AI trends...');
    const blogResponse = await api.post('/content/generate/text', {
      prompt: 'Write a short blog post about the latest AI trends',
      type: 'blog',
      maxTokens: 300,
      temperature: 0.7
    });
    console.log('✓ Blog post generated');
    console.log('Preview:', blogResponse.data.data.content.substring(0, 150) + '...');
    console.log('');

    // 6. Generate content package
    console.log('6️⃣ Generating complete content package...');
    const packageResponse = await api.post('/content/generate/package', {
      trend: 'Artificial Intelligence',
      includeText: true,
      includeImage: true,
      includeVoiceover: false,
      contentTypes: ['tweet', 'blog']
    });
    console.log('✓ Content package generated');
    console.log('Contents:', Object.keys(packageResponse.data.data.contents));
    console.log('');

    // 7. Check health status
    console.log('7️⃣ Checking API health...');
    const healthResponse = await api.get('/health/detailed');
    console.log('✓ System status:', healthResponse.data.status);
    console.log('Services:', healthResponse.data.services);
    console.log('');

    console.log('✅ All examples completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

// Run the examples
if (require.main === module) {
  main();
}

module.exports = { main };
