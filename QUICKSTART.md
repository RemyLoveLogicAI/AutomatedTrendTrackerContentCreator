# Quick Setup Guide

This guide will help you get the application running quickly.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (recommended)
- Git

## 5-Minute Quick Start

### Option 1: Docker Compose (Easiest)

1. **Clone the repository**
   ```bash
   git clone https://github.com/RemyLoveLogicAI/AutomatedTrendTrackerContentCreator.git
   cd AutomatedTrendTrackerContentCreator
   ```

2. **Configure API keys**
   ```bash
   cp .env.example .env
   nano .env  # or use your preferred editor
   ```
   
   At minimum, add:
   - `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the dashboard**
   - Open http://localhost in your browser
   - API available at http://localhost:3000

### Option 2: Local Development

1. **Clone and install**
   ```bash
   git clone https://github.com/RemyLoveLogicAI/AutomatedTrendTrackerContentCreator.git
   cd AutomatedTrendTrackerContentCreator
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start Redis (required for queues)**
   ```bash
   docker run -d -p 6379:6379 redis:7-alpine
   ```

4. **Start the backend**
   ```bash
   npm run dev
   ```

5. **Start the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3001
   - Backend: http://localhost:3000

## API Keys Setup

### Essential (for core features)

1. **OpenAI API Key** (Required for content generation)
   - Sign up at https://platform.openai.com
   - Create API key: https://platform.openai.com/api-keys
   - Add to `.env`: `OPENAI_API_KEY=sk-...`

### Optional (for trend detection)

2. **Twitter API** (for Twitter trends)
   - Apply for access: https://developer.twitter.com
   - Add to `.env`:
     ```
     TWITTER_BEARER_TOKEN=AAA...
     ```

3. **YouTube API** (for YouTube trends)
   - Get API key: https://console.cloud.google.com
   - Enable YouTube Data API v3
   - Add to `.env`: `YOUTUBE_API_KEY=AIz...`

4. **Reddit API** (for Reddit trends)
   - Create app: https://www.reddit.com/prefs/apps
   - Add to `.env`:
     ```
     REDDIT_CLIENT_ID=...
     REDDIT_CLIENT_SECRET=...
     ```

### Optional (for advanced features)

5. **ElevenLabs** (for premium voice generation)
   - Sign up: https://elevenlabs.io
   - Add to `.env`: `ELEVENLABS_API_KEY=...`

6. **AWS S3** (for cloud storage)
   - Create S3 bucket: https://console.aws.amazon.com/s3
   - Add to `.env`:
     ```
     AWS_ACCESS_KEY_ID=...
     AWS_SECRET_ACCESS_KEY=...
     AWS_S3_BUCKET=bucket-name
     ```

## Testing the Setup

1. **Check API health**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Get trending topics**
   ```bash
   curl http://localhost:3000/api/trends?limit=5
   ```

3. **Generate text content**
   ```bash
   curl -X POST http://localhost:3000/api/content/text \
     -H "Content-Type: application/json" \
     -d '{"topic":"AI trends","type":"tweet"}'
   ```

## Common Issues

### Port already in use
```bash
# Change ports in docker-compose.yml or .env
PORT=3001
```

### Database connection failed
```bash
# Make sure databases are running
docker-compose ps
# Restart if needed
docker-compose restart postgres mongo
```

### Redis connection failed
```bash
# Start Redis
docker run -d -p 6379:6379 redis:7-alpine
# Or use docker-compose
docker-compose up -d redis
```

### API keys not working
- Verify keys are correct in `.env`
- Check for extra spaces or quotes
- Restart the application after changing `.env`

## Next Steps

1. Read the full [README.md](README.md)
2. Explore the [API Documentation](docs/API.md)
3. Check the [Contributing Guide](CONTRIBUTING.md)
4. Review [Deployment Guide](docs/DEPLOYMENT.md) for production setup

## Getting Help

- **Issues**: https://github.com/RemyLoveLogicAI/AutomatedTrendTrackerContentCreator/issues
- **Discussions**: https://github.com/RemyLoveLogicAI/AutomatedTrendTrackerContentCreator/discussions

---

**Enjoy using Trend Tracker! 🚀**
