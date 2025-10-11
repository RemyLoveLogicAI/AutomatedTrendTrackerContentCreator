# Quick Start Guide

Get up and running with Automated Trend Tracker & Content Creator in minutes!

## Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0
- At least one API key (OpenAI recommended for testing)

## 5-Minute Setup

### 1. Clone and Install

```bash
git clone https://github.com/RemyLoveLogicAI/AutomatedTrendTrackerContentCreator.git
cd AutomatedTrendTrackerContentCreator
./setup.sh
```

Or manually:
```bash
npm install
cp .env.example .env
mkdir -p logs uploads generated
```

### 2. Configure API Keys

Edit `.env` file and add at least your OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-openai-key-here
```

**Optional but recommended:**
- `TWITTER_BEARER_TOKEN` - For Twitter trends
- `YOUTUBE_API_KEY` - For YouTube trends
- `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` - For Reddit trends

### 3. Start the Server

```bash
npm start
```

The API will be available at `http://localhost:3000`

### 4. Test the API

**Get trends (works without API keys - returns mock data):**
```bash
curl http://localhost:3000/api/trends/trends
```

**Generate content (requires OpenAI API key):**
```bash
curl -X POST http://localhost:3000/api/content/generate/text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a short tweet about AI", "type": "tweet"}'
```

**Check health:**
```bash
curl http://localhost:3000/api/health/detailed
```

## Using the Frontend (Optional)

### Start Frontend Development Server

```bash
cd frontend
npm install
npm start
```

Access the dashboard at `http://localhost:3001`

## Using Docker (Recommended for Production)

### Quick Start with Docker Compose

```bash
docker-compose up -d
```

This starts:
- Main application (port 3000)
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- MongoDB (port 27017)

### View Logs

```bash
docker-compose logs -f app
```

## Common API Endpoints

### Trends
- `GET /api/trends/trends` - Get all trends
- `GET /api/trends/trends/twitter` - Twitter trends
- `GET /api/trends/trends/reddit` - Reddit trends
- `GET /api/trends/trends/youtube` - YouTube trends
- `GET /api/trends/trends/google` - Google trends

### Content Generation
- `POST /api/content/generate/text` - Generate text
- `POST /api/content/generate/image` - Generate image
- `POST /api/content/generate/voiceover` - Generate voiceover
- `POST /api/content/generate/package` - Complete content package

### Health
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed status

## Example Usage

### Generate a Blog Post

```bash
curl -X POST http://localhost:3000/api/content/generate/text \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write about the impact of AI on healthcare",
    "type": "blog",
    "maxTokens": 500
  }'
```

### Fetch Twitter Trends

```bash
curl "http://localhost:3000/api/trends/trends/twitter?limit=5"
```

### Generate Content Package

```bash
curl -X POST http://localhost:3000/api/content/generate/package \
  -H "Content-Type: application/json" \
  -d '{
    "trend": "AI in Healthcare",
    "includeText": true,
    "includeImage": true,
    "contentTypes": ["tweet", "blog"]
  }'
```

## Development Mode

For development with auto-reload:

```bash
npm run dev
```

## Testing Without API Keys

The application works without API keys by providing mock data. This is perfect for:
- Testing the API structure
- Frontend development
- Understanding the data format
- Learning how to use the platform

**Note:** Mock data will be returned when API keys are not configured.

## Next Steps

1. **Configure More APIs** - Add Twitter, YouTube, Reddit API keys for real trend data
2. **Explore the Frontend** - View trends and generate content through the UI
3. **Read the Docs** - Check out [API.md](docs/API.md) and [DEPLOYMENT.md](docs/DEPLOYMENT.md)
4. **Customize** - Modify services to fit your needs
5. **Deploy** - Use Docker/Kubernetes for production deployment

## Troubleshooting

**Server won't start:**
- Check Node.js version: `node -v` (should be >= 14)
- Check if port 3000 is available
- Review logs for errors

**API returns errors:**
- Verify API keys are correct in `.env`
- Check API key quotas/limits
- Review error messages in logs

**Dependencies won't install:**
- Update npm: `npm install -g npm@latest`
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and reinstall

## Support

- Check the [README.md](README.md) for detailed documentation
- Review [API Documentation](docs/API.md)
- See [Contributing Guide](CONTRIBUTING.md) to contribute

---

**Happy Tracking! 🚀**
