.PHONY: help install dev build test lint clean docker-up docker-down deploy-k8s

# Default target
help:
	@echo "Automated Trend Tracker & Content Creator - Available Commands:"
	@echo ""
	@echo "  make install        Install all dependencies"
	@echo "  make dev            Start development servers"
	@echo "  make build          Build for production"
	@echo "  make test           Run tests"
	@echo "  make lint           Run linter"
	@echo "  make clean          Clean build artifacts"
	@echo "  make docker-up      Start with Docker Compose"
	@echo "  make docker-down    Stop Docker Compose"
	@echo "  make deploy-k8s     Deploy to Kubernetes"
	@echo ""

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installation complete!"

# Development
dev:
	@echo "Starting development servers..."
	@echo "Backend will run on http://localhost:3000"
	@echo "Frontend will run on http://localhost:3001"
	@echo ""
	npm run dev & cd frontend && npm run dev

# Build
build:
	@echo "Building backend..."
	npm run build || echo "No build script defined"
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "Build complete!"

# Run tests
test:
	@echo "Running tests..."
	npm test

# Run linter
lint:
	@echo "Running ESLint..."
	npm run lint
	@echo "Linting complete!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf node_modules
	rm -rf frontend/node_modules
	rm -rf frontend/dist
	rm -rf frontend/build
	rm -rf coverage
	rm -rf logs
	rm -rf generated
	@echo "Clean complete!"

# Docker Compose
docker-up:
	@echo "Starting Docker Compose..."
	docker-compose up -d
	@echo "Services started!"
	@echo "Frontend: http://localhost"
	@echo "Backend: http://localhost:3000"
	@echo ""
	@echo "View logs: docker-compose logs -f"

docker-down:
	@echo "Stopping Docker Compose..."
	docker-compose down
	@echo "Services stopped!"

docker-rebuild:
	@echo "Rebuilding and starting Docker Compose..."
	docker-compose up -d --build
	@echo "Services rebuilt and started!"

# Kubernetes deployment
deploy-k8s:
	@echo "Deploying to Kubernetes..."
	kubectl apply -f k8s/storage.yaml
	kubectl apply -f k8s/database-deployment.yaml
	kubectl apply -f k8s/app-deployment.yaml
	@echo "Deployment complete!"
	@echo "Check status: kubectl get pods"

# Database setup
db-setup:
	@echo "Setting up databases..."
	docker-compose up -d postgres mongo redis
	@echo "Databases started!"

# View logs
logs:
	@echo "Viewing Docker Compose logs..."
	docker-compose logs -f

# Health check
health:
	@echo "Checking API health..."
	curl -s http://localhost:3000/api/health | jq . || echo "API not running"

# Quick start
quick-start: install docker-up
	@echo ""
	@echo "✅ Quick start complete!"
	@echo "Frontend: http://localhost"
	@echo "Backend: http://localhost:3000"
	@echo ""
	@echo "Next steps:"
	@echo "1. Configure your API keys in .env"
	@echo "2. Check health: make health"
	@echo "3. View logs: make logs"
