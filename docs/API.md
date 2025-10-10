# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, the API does not require authentication. In production, implement JWT-based authentication.

---

## Trend Detection Endpoints

### GET /trends/trends
Get aggregated trends from all sources.

**Query Parameters:**
- `source` (string, optional): Filter by source (twitter, reddit, youtube, google)
- `limit` (number, optional): Number of results (default: 10)
- `language` (string, optional): Language code (default: en)

**Example Request:**
```bash
curl "http://localhost:3000/api/trends/trends?limit=5"
```

**Example Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "1",
      "topic": "AI and Machine Learning",
      "source": "twitter",
      "popularity": 95,
      "timestamp": "2024-10-10T14:00:00Z",
      "metadata": {}
    }
  ]
}
```

### POST /content/generate/text
Generate text content using AI.

**Request Body:**
```json
{
  "prompt": "Write about AI trends in 2024",
  "type": "blog",
  "maxTokens": 500,
  "temperature": 0.7
}
```

For complete API documentation, see the full documentation in the repository.
