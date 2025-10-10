# Multi-stage build for production
FROM node:18-alpine AS base

# Install FFmpeg and dependencies
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++

WORKDIR /usr/src/app

# Dependencies stage
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --only=production

# Development dependencies
FROM dependencies AS dev-dependencies
RUN npm ci

# Build stage
FROM dev-dependencies AS build
COPY . .

# Production stage
FROM base AS production

# Copy node_modules from dependencies stage
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs generated/images generated/videos generated/audio

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/index.js"]