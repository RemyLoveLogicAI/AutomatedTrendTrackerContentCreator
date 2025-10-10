# Deployment Guide

This guide covers deploying the Automated Trend Tracker & Content Creator platform to various environments.

---

## Table of Contents

- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Cloud Platforms](#cloud-platforms)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Docker Deployment

### Single Container

Build and run the backend:

```bash
docker build -t trend-tracker .
docker run -d -p 3000:3000 --env-file .env trend-tracker
```

### Docker Compose (Recommended)

Run the entire stack with one command:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

**Services included:**
- Backend API (port 3000)
- Frontend dashboard (port 80)
- PostgreSQL database (port 5432)
- MongoDB database (port 27017)
- Redis cache (port 6379)

### Custom Configuration

Create a `docker-compose.override.yml`:

```yaml
version: '3.8'
services:
  app:
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    volumes:
      - ./custom-config:/usr/src/app/config
```

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Container registry access

### Quick Start

1. **Create namespace**
   ```bash
   kubectl create namespace trend-tracker
   ```

2. **Create secrets**
   ```bash
   kubectl create secret generic trend-tracker-secrets \
     --from-literal=openai-api-key=YOUR_KEY \
     --from-literal=database-url=postgresql://... \
     --from-literal=mongodb-uri=mongodb://... \
     --from-literal=postgres-user=postgres \
     --from-literal=postgres-password=YOUR_PASSWORD \
     -n trend-tracker
   ```

3. **Apply configurations**
   ```bash
   kubectl apply -f k8s/storage.yaml -n trend-tracker
   kubectl apply -f k8s/database-deployment.yaml -n trend-tracker
   kubectl apply -f k8s/app-deployment.yaml -n trend-tracker
   ```

4. **Verify deployment**
   ```bash
   kubectl get pods -n trend-tracker
   kubectl get services -n trend-tracker
   ```

5. **Access the application**
   ```bash
   kubectl port-forward service/trend-tracker-service 3000:80 -n trend-tracker
   ```

### Scaling

Scale the application:

```bash
kubectl scale deployment trend-tracker-app --replicas=5 -n trend-tracker
```

Enable autoscaling:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: trend-tracker-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: trend-tracker-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## Cloud Platforms

### AWS (ECS)

1. **Create ECR repository**
   ```bash
   aws ecr create-repository --repository-name trend-tracker
   ```

2. **Build and push image**
   ```bash
   docker build -t trend-tracker .
   docker tag trend-tracker:latest AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/trend-tracker:latest
   docker push AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/trend-tracker:latest
   ```

3. **Create ECS task definition**
   ```json
   {
     "family": "trend-tracker",
     "containerDefinitions": [
       {
         "name": "app",
         "image": "AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/trend-tracker:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ]
       }
     ]
   }
   ```

### Google Cloud Platform (Cloud Run)

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/trend-tracker

# Deploy
gcloud run deploy trend-tracker \
  --image gcr.io/PROJECT_ID/trend-tracker \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure (Container Instances)

```bash
# Create resource group
az group create --name trend-tracker-rg --location eastus

# Deploy container
az container create \
  --resource-group trend-tracker-rg \
  --name trend-tracker \
  --image YOUR_REGISTRY/trend-tracker:latest \
  --dns-name-label trend-tracker \
  --ports 3000
```

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create trend-tracker

# Set buildpack
heroku buildpacks:set heroku/nodejs

# Deploy
git push heroku main

# Set environment variables
heroku config:set OPENAI_API_KEY=your_key
```

---

## Environment Configuration

### Required Variables

```bash
# API Keys
OPENAI_API_KEY=sk-...
TWITTER_BEARER_TOKEN=AAA...
YOUTUBE_API_KEY=AIz...
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
MONGODB_URI=mongodb://host:27017/db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS (if using)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=bucket-name
```

### Production Settings

```bash
NODE_ENV=production
LOG_LEVEL=warn
ENABLE_ETHICAL_FILTERS=true
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Monitoring & Maintenance

### Health Checks

Monitor application health:

```bash
curl http://localhost:3000/api/health
```

### Logs

**Docker Compose:**
```bash
docker-compose logs -f app
```

**Kubernetes:**
```bash
kubectl logs -f deployment/trend-tracker-app -n trend-tracker
```

### Database Backups

**PostgreSQL:**
```bash
docker exec postgres pg_dump -U postgres trendtracker > backup.sql
```

**MongoDB:**
```bash
docker exec mongo mongodump --db trendtracker --out /backup
```

### Updates

1. **Build new image**
   ```bash
   docker build -t trend-tracker:v2 .
   ```

2. **Update deployment**
   ```bash
   # Docker Compose
   docker-compose up -d --build
   
   # Kubernetes
   kubectl set image deployment/trend-tracker-app app=trend-tracker:v2 -n trend-tracker
   ```

3. **Verify**
   ```bash
   # Check version
   curl http://localhost:3000/api/health
   ```

---

## Security Best Practices

1. **Use secrets management**
   - Never commit `.env` files
   - Use Kubernetes secrets or cloud provider secret managers
   
2. **Enable HTTPS**
   - Use Let's Encrypt for free SSL certificates
   - Configure reverse proxy (nginx, Traefik)

3. **Firewall rules**
   - Restrict database access to application only
   - Use security groups/network policies

4. **Regular updates**
   - Keep dependencies updated
   - Monitor security advisories

5. **Backup strategy**
   - Automated daily backups
   - Test restore procedures regularly

---

## Troubleshooting

### Common Issues

**Database connection failed:**
```bash
# Check database is running
docker-compose ps
# Check connection string
echo $DATABASE_URL
```

**Redis connection failed:**
```bash
# Test Redis connection
redis-cli ping
```

**Out of memory:**
```bash
# Increase memory limits in docker-compose.yml or k8s
resources:
  limits:
    memory: "2Gi"
```

**High CPU usage:**
```bash
# Scale horizontally
docker-compose scale app=3
```

---

## Support

For deployment issues, please:
1. Check the [troubleshooting section](#troubleshooting)
2. Review application logs
3. Open an issue on GitHub
4. Contact the maintainers
