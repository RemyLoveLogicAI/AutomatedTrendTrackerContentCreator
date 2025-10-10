# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, the API does not require authentication. Authentication will be added in future versions.

---

## Endpoints

### Trends

#### Get Trends
Fetch trending topics from multiple sources.

**Endpoint:** `GET /trends`

**Query Parameters:**
- `source` (optional): Filter by source (`twitter`, `reddit`, `youtube`, `google`, or `all`)
- `region` (optional): Geographic region (default: `US`)
- `limit` (optional): Number of results (default: `10`, max: `100`)
- `category` (optional): Content category (YouTube only)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "twitter_1",
      "topic": "Artificial Intelligence",
      "popularity": 95000,
      "source": "twitter",
      "description": "Latest AI developments",
      "url": "https://..."
    }
  ],
  "metadata": {
    "region": "US",
    "sources": "all",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Trend Details
Get detailed information about a specific trend.

**Endpoint:** `GET /trends/:id`

**Query Parameters:**
- `source` (required): Source platform

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "twitter_1",
    "topic": "AI",
    "content": "Detailed content...",
    "metrics": {
      "views": 1000000,
      "engagement": 50000
    }
  }
}
```

#### Analyze Trend Potential
Analyze custom text or topic for trending potential.

**Endpoint:** `POST /trends/analyze`

**Request Body:**
```json
{
  "text": "Your content here...",
  "topic": "Optional topic"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sentiment": "POSITIVE",
    "category": "technology",
    "keywords": ["ai", "machine", "learning"],
    "trendPotential": 85,
    "recommendations": [
      "This topic fits the technology category",
      "Add trending hashtags for better reach"
    ]
  }
}
```

---

### Content Generation

#### Generate Text Content
Create text content like blogs, tweets, or scripts.

**Endpoint:** `POST /content/text`

**Request Body:**
```json
{
  "topic": "Artificial Intelligence in 2024",
  "type": "blog",
  "tone": "professional",
  "length": "medium",
  "language": "en"
}
```

**Parameters:**
- `topic` (required): Content topic
- `type` (optional): `blog`, `tweet`, `script`, `article`, `description` (default: `blog`)
- `tone` (optional): `professional`, `casual`, `friendly`, `formal` (default: `professional`)
- `length` (optional): `short`, `medium`, `long`, `verylong` (default: `medium`)
- `language` (optional): Language code (default: `en`)

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "blog",
    "topic": "Artificial Intelligence in 2024",
    "content": "Generated content here...",
    "metadata": {
      "tone": "professional",
      "length": "medium",
      "language": "en",
      "wordCount": 450,
      "generatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Generate Images
Create AI-generated images.

**Endpoint:** `POST /content/image`

**Request Body:**
```json
{
  "prompt": "A futuristic city with AI-powered transportation",
  "style": "realistic",
  "size": "1024x1024",
  "count": 1
}
```

**Parameters:**
- `prompt` (required): Image description
- `style` (optional): `realistic`, `artistic`, `cartoon`, `abstract` (default: `realistic`)
- `size` (optional): `512x512`, `1024x1024` (default: `1024x1024`)
- `count` (optional): Number of images (1-4, default: 1)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "url": "/generated/images/dalle_123456.png",
      "prompt": "A futuristic city...",
      "model": "dall-e-3",
      "size": "1024x1024"
    }
  ]
}
```

#### Generate Video
Create video content (asynchronous job).

**Endpoint:** `POST /content/video`

**Request Body:**
```json
{
  "script": "Welcome to our platform...",
  "images": [],
  "voiceover": true,
  "duration": 60
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "12345",
    "status": "queued",
    "message": "Video generation started. Check status at /api/content/status/12345"
  }
}
```

#### Generate Voiceover
Convert text to speech.

**Endpoint:** `POST /content/voice`

**Request Body:**
```json
{
  "text": "Hello, welcome to our platform",
  "voice": "default",
  "language": "en",
  "speed": 1.0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "/generated/audio/voice_123456.mp3",
    "format": "mp3",
    "provider": "google-tts",
    "language": "en"
  }
}
```

#### Check Job Status
Monitor the status of asynchronous jobs.

**Endpoint:** `GET /content/status/:jobId`

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "12345",
    "status": "completed",
    "progress": 100,
    "result": {
      "url": "/generated/videos/video_123456.mp4"
    }
  }
}
```

**Job Statuses:**
- `queued`: Job is waiting to be processed
- `active`: Job is currently being processed
- `completed`: Job finished successfully
- `failed`: Job encountered an error

---

### Health

#### Health Check
Check API and service health.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

---

## Error Responses

All endpoints follow a standard error response format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

**Common HTTP Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service degraded

---

## Rate Limiting

The API implements rate limiting to ensure fair usage:
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Headers**: Rate limit info is included in response headers

---

## Best Practices

1. **Use appropriate parameters**: Specify only the parameters you need
2. **Handle errors gracefully**: Always check the `success` field
3. **Monitor job status**: For async operations, poll the status endpoint
4. **Cache responses**: Cache trend data when appropriate
5. **Respect rate limits**: Implement exponential backoff for retries
