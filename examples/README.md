# Examples

This directory contains example scripts demonstrating how to use the Automated Trend Tracker & Content Creator API.

## Available Examples

### 1. Basic Usage (`basic-usage.js`)

Demonstrates core functionality:
- Fetching trends from different sources
- Analyzing trends with NLP
- Generating content (tweets, blog posts)
- Creating content packages
- Health checks

**Run it:**
```bash
node examples/basic-usage.js
```

**Requirements:**
- Server running on `http://localhost:3000`
- At least OpenAI API key configured for content generation

## Creating Your Own Examples

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Fetch trends
const trends = await api.get('/trends/trends');

// Generate content
const content = await api.post('/content/generate/text', {
  prompt: 'Your prompt here',
  type: 'blog'
});
```

## Example Output

When you run `basic-usage.js`, you should see output like:

```
🚀 Automated Trend Tracker - Example Usage

1️⃣ Fetching aggregated trends from all sources...
✓ Found 5 trends
Top trend: AI and Machine Learning

2️⃣ Fetching Twitter trends...
✓ Found 3 Twitter trends

3️⃣ Analyzing trends with NLP...
✓ Analyzed 3 trends
Top analyzed trend: { topic: 'AI and Machine Learning', nlpScore: 95, sentiment: 'positive' }

4️⃣ Generating tweet about "AI and Machine Learning"...
✓ Tweet generated:
"🤖 AI is revolutionizing how we work and live! #AI #MachineLearning #Future"

5️⃣ Generating blog post about AI trends...
✓ Blog post generated
Preview: # The Latest AI Trends...

6️⃣ Generating complete content package...
✓ Content package generated
Contents: [ 'text', 'image' ]

7️⃣ Checking API health...
✓ System status: healthy

✅ All examples completed successfully!
```

## Tips

1. **Start the server first**: Make sure the API server is running
2. **Configure API keys**: Add your API keys to `.env` for full functionality
3. **Check logs**: Review server logs if you encounter errors
4. **Experiment**: Modify the examples to test different features

## More Examples Coming Soon

- Advanced content generation
- Batch processing
- Webhook integration
- Video generation workflow
- Multi-language content creation

## Contributing

Have a useful example? Submit a PR! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
