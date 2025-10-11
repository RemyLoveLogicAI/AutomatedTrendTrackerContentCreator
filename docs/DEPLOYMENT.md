# Deployment Guide

This guide covers different deployment options for the Automated Trend Tracker & Content Creator platform.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Environment Configuration](#environment-configuration)

---

## Local Development

### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0
- PostgreSQL (optional)
- Redis (optional)

### Steps

1. **Clone and Install**
   ```bash
   git clone https://github.com/RemyLoveLogicAI/AutomatedTrendTrackerContentCreator.git
   cd AutomatedTrendTrackerContentCreator
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start the Server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

4. **Access the Application**
   - API: http://localhost:3000
   - Frontend: http://localhost:3001 (if running separately)

---

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Build and Start**
   ```bash
   docker-compose up -d
   ```

2. **View Logs**
   ```bash
   docker-compose logs -f app
   ```

3. **Stop Services**
   ```bash
   docker-compose down
   ```

### Manual Docker Build

1. **Build Image**
   ```bash
   docker build -t trend-tracker:latest .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     -p 3000:3000 \
     --env-file .env \
     --name trend-tracker \
     trend-tracker:latest
   ```

---

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (minikube, GKE, EKS, AKS)
- kubectl CLI configured

### Steps

1. **Create Secrets**
   ```bash
   kubectl create secret generic trend-tracker-secrets \
     --from-literal=OPENAI_API_KEY=your-key \
     --from-literal=TWITTER_BEARER_TOKEN=your-token \
     --from-literal=POSTGRES_PASSWORD=your-password \
     --from-literal=JWT_SECRET=your-secret
   ```

2. **Deploy Database Services**
   ```bash
   kubectl apply -f k8s/database.yaml
   ```

3. **Deploy Application**
   ```bash
   kubectl apply -f k8s/deployment.yaml
   ```

4. **Check Status**
   ```bash
   kubectl get pods
   kubectl get services
   ```

5. **Access Application**
   ```bash
   # Get external IP
   kubectl get service trend-tracker-service
   ```

### Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment trend-tracker-app --replicas=5

# Autoscaling
kubectl autoscale deployment trend-tracker-app \
  --min=2 --max=10 --cpu-percent=80
```

---

## Cloud Deployment

### AWS ECS

1. **Push Image to ECR**
   ```bash
   aws ecr create-repository --repository-name trend-tracker
   docker tag trend-tracker:latest [account-id].dkr.ecr.[region].amazonaws.com/trend-tracker:latest
   docker push [account-id].dkr.ecr.[region].amazonaws.com/trend-tracker:latest
   ```

2. **Create ECS Task Definition and Service**
   Use AWS Console or CLI to create task definition and service.

### Google Cloud Run

1. **Build and Deploy**
   ```bash
   gcloud builds submit --tag gcr.io/[project-id]/trend-tracker
   gcloud run deploy trend-tracker \
     --image gcr.io/[project-id]/trend-tracker \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Heroku

1. **Login and Create App**
   ```bash
   heroku login
   heroku create trend-tracker-app
   ```

2. **Add Buildpack and Deploy**
   ```bash
   heroku buildpacks:set heroku/nodejs
   git push heroku main
   ```

3. **Configure Environment**
   ```bash
   heroku config:set OPENAI_API_KEY=your-key
   heroku config:set NODE_ENV=production
   ```

---

## Environment Configuration

### Required Variables

```bash
# Server
NODE_ENV=production
PORT=3000

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=trend_tracker
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# API Keys
OPENAI_API_KEY=your_openai_key
TWITTER_BEARER_TOKEN=your_twitter_token
YOUTUBE_API_KEY=your_youtube_key

# Security
JWT_SECRET=your_secure_jwt_secret
```

### Optional Variables

```bash
# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=./path/to/key.json

# Feature Flags
ENABLE_IMAGE_GENERATION=true
ENABLE_VIDEO_GENERATION=true
ENABLE_CONTENT_FILTER=true
```

---

## Performance Optimization

### 1. Enable Caching
- Configure Redis for caching API responses
- Set appropriate TTL values

### 2. Database Optimization
- Use connection pooling
- Add indexes for frequently queried fields
- Regular database maintenance

### 3. Load Balancing
- Use Kubernetes ingress or cloud load balancers
- Distribute traffic across multiple instances

### 4. CDN
- Serve static assets through CDN
- Cache API responses at edge locations

---

## Monitoring and Logging

### Application Logs
```bash
# Docker
docker-compose logs -f app

# Kubernetes
kubectl logs -f deployment/trend-tracker-app
```

### Health Checks
- Endpoint: `/api/health`
- Detailed: `/api/health/detailed`

### Monitoring Tools
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **ELK Stack**: Log aggregation
- **New Relic/Datadog**: APM

---

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** in production
4. **Implement rate limiting**
5. **Regular security updates**
6. **Use strong passwords** for databases
7. **Implement authentication** for production APIs

---

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
lsof -i :3000
kill -9 [PID]
```

**Database Connection Failed**
- Check database is running
- Verify credentials
- Check network connectivity

**API Keys Not Working**
- Verify keys are valid
- Check API quotas
- Review API documentation

---

## Backup and Recovery

### Database Backup
```bash
# PostgreSQL
pg_dump -U postgres trend_tracker > backup.sql

# Restore
psql -U postgres trend_tracker < backup.sql
```

### Docker Volumes
```bash
# Backup
docker run --rm -v postgres-data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres-backup.tar.gz /data

# Restore
docker run --rm -v postgres-data:/data -v $(pwd):/backup ubuntu tar xzf /backup/postgres-backup.tar.gz -C /
```

---

For more information, see the [README](../README.md) or [API Documentation](./API.md).
