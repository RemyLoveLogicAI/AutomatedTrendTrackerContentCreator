# Automated Trend Tracker & Content Creator

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

A comprehensive, state-of-the-art AI-powered platform for automated trend tracking and multimedia content generation.

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 🌟 Features

### Trend Detection & Analysis
- **Real-time API Integrations**: Monitor trends from Twitter/X, Google Trends, Reddit, and YouTube
- **ML-based Ranking**: Advanced NLP using Hugging Face Transformers for intelligent trend scoring
- **Multi-source Aggregation**: Combine and rank trends from multiple platforms
- **Sentiment Analysis**: Understand the emotional context of trending topics

### Content Generation
- **Text Generation**: Create blogs, tweets, scripts, and articles using OpenAI GPT
- **Image Generation**: AI-powered image creation with DALL·E 3 and Stable Diffusion
- **Video Production**: Automated video editing with FFmpeg
- **Voiceover Services**: Professional text-to-speech with ElevenLabs and Google TTS
- **Multi-language Support**: Generate content in multiple languages

### Automation & Scalability
- **Task Queue System**: Efficient job processing with Bull and Redis
- **Database Support**: PostgreSQL and MongoDB for flexible data storage
- **Cloud Integration**: AWS S3 for asset storage and management
- **Docker & Kubernetes**: Production-ready containerization and orchestration

### User Interface
- **React Dashboard**: Modern, responsive web interface
- **Trend Visualization**: Interactive charts and data displays
- **Content Customization**: Fine-tune generation parameters
- **Real-time Monitoring**: Track job progress and system health

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 14.0.0
- Docker and Docker Compose (optional but recommended)
- PostgreSQL or MongoDB (or use Docker Compose)
- Redis (or use Docker Compose)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RemyLoveLogicAI/AutomatedTrendTrackerContentCreator.git
   cd AutomatedTrendTrackerContentCreator
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   - OpenAI API key for text and image generation
   - Twitter API credentials for trend detection
   - Reddit API credentials
   - YouTube API key
   - Google Trends API key (optional)
   - ElevenLabs API key (optional, for premium voiceover)
   - AWS credentials (for S3 storage)

4. **Run with Docker Compose** (Recommended)
   ```bash
   docker-compose up -d
   ```
   
   This will start:
   - Main application (port 3000)
   - Frontend dashboard (port 80)
   - PostgreSQL database
   - MongoDB database
   - Redis queue

5. **OR run locally**
   ```bash
   # Start backend
   npm start
   
   # Start frontend (in another terminal)
   cd frontend && npm run dev
   ```

6. **Access the application**
   - Frontend Dashboard: http://localhost (Docker) or http://localhost:3001 (local)
   - Backend API: http://localhost:3000
   - API Health Check: http://localhost:3000/api/health

---

## 📖 Documentation

### API Endpoints

#### Trend Detection
- `GET /api/trends` - Fetch trending topics from all sources
- `GET /api/trends/:id` - Get detailed information about a specific trend
- `POST /api/trends/analyze` - Analyze custom text for trending potential

**Query Parameters:**
- `source`: Filter by source (twitter, reddit, youtube, google)
- `region`: Geographic region (US, UK, CA, AU, IN)
- `limit`: Number of results (default: 10)
- `category`: Content category (for YouTube)

#### Content Generation
- `POST /api/content/text` - Generate text content (blog, tweet, script)
- `POST /api/content/image` - Generate AI images
- `POST /api/content/video` - Generate video content (queued)
- `POST /api/content/voice` - Generate voiceover
- `POST /api/content/complete` - Generate complete content package
- `GET /api/content/status/:jobId` - Check job status

#### Health & Monitoring
- `GET /api/health` - System health check

### Configuration

#### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | development |
| `PORT` | Server port | No | 3000 |
| `DATABASE_URL` | PostgreSQL connection string | No* | - |
| `MONGODB_URI` | MongoDB connection string | No* | - |
| `REDIS_HOST` | Redis host | No | localhost |
| `OPENAI_API_KEY` | OpenAI API key | Yes† | - |
| `TWITTER_BEARER_TOKEN` | Twitter API bearer token | No | - |
| `REDDIT_CLIENT_ID` | Reddit client ID | No | - |
| `YOUTUBE_API_KEY` | YouTube API key | No | - |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | No | - |
| `AWS_ACCESS_KEY_ID` | AWS access key | No | - |
| `AWS_S3_BUCKET` | AWS S3 bucket name | No | - |

\* At least one database (PostgreSQL or MongoDB) is recommended
† Required for content generation features

### Usage Examples

#### Fetch Trending Topics
```bash
curl http://localhost:3000/api/trends?source=twitter&limit=10
```

#### Generate Blog Post
```bash
curl -X POST http://localhost:3000/api/content/text \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Artificial Intelligence in 2024",
    "type": "blog",
    "tone": "professional",
    "length": "medium",
    "language": "en"
  }'
```

#### Generate AI Image
```bash
curl -X POST http://localhost:3000/api/content/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic city with AI-powered transportation",
    "style": "realistic",
    "size": "1024x1024",
    "count": 1
  }'
```

#### Generate Video (Queued Job)
```bash
curl -X POST http://localhost:3000/api/content/video \
  -H "Content-Type: application/json" \
  -d '{
    "script": "Welcome to our AI-powered content platform...",
    "duration": 60,
    "voiceover": true
  }'
```

---

## 🏗️ Architecture

### Backend Structure
```
src/
├── api/                    # API route handlers
│   ├── trendDetection.js
│   ├── contentGeneration.js
│   └── health.js
├── services/               # Business logic
│   ├── trendDetection/     # Trend detection services
│   ├── contentGeneration/  # Content generation services
│   ├── ml/                 # Machine learning services
│   └── queue/              # Job queue management
├── config/                 # Configuration files
├── middleware/             # Express middleware
├── models/                 # Database models
└── utils/                  # Utility functions
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   └── utils/              # Utility functions
└── public/                 # Static assets
```

---

## 🐳 Deployment

### Docker

Build and run with Docker:
```bash
docker build -t trend-tracker .
docker run -p 3000:3000 --env-file .env trend-tracker
```

### Kubernetes

Deploy to Kubernetes cluster:
```bash
# Create secrets
kubectl create secret generic trend-tracker-secrets \
  --from-literal=openai-api-key=YOUR_KEY \
  --from-literal=database-url=YOUR_DB_URL

# Apply configurations
kubectl apply -f k8s/storage.yaml
kubectl apply -f k8s/database-deployment.yaml
kubectl apply -f k8s/app-deployment.yaml
```

### Cloud Platforms

The application is ready for deployment on:
- AWS (ECS, EKS, EC2)
- Google Cloud Platform (GKE, Cloud Run)
- Azure (AKS, Container Instances)
- DigitalOcean (Kubernetes, App Platform)
- Heroku

---

## 🧪 Testing

Run tests:
```bash
npm test
```

Run with coverage:
```bash
npm test -- --coverage
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- OpenAI for GPT and DALL·E APIs
- Hugging Face for transformer models
- ElevenLabs for voice generation
- Stability AI for Stable Diffusion
- All open-source contributors

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/RemyLoveLogicAI/AutomatedTrendTrackerContentCreator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/RemyLoveLogicAI/AutomatedTrendTrackerContentCreator/discussions)

---

## 🗺️ Roadmap

- [ ] Advanced analytics dashboard
- [ ] Multi-user support with authentication
- [ ] Scheduled content generation
- [ ] Social media direct publishing
- [ ] Custom ML model training
- [ ] Browser extension
- [ ] Mobile app

---

<div align="center">

**Made with ❤️ by [RemyLoveLogicAI](https://github.com/RemyLoveLogicAI)**

⭐ Star this repository if you find it helpful!

</div>
