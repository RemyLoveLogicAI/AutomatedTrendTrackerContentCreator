#!/bin/bash

# Automated Trend Tracker & Content Creator - Setup Script
# This script helps you set up the development environment

set -e

echo "=========================================="
echo "Automated Trend Tracker Setup"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -n "Checking Node.js installation... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "Please install Node.js >= 14.0.0 from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
echo -n "Checking npm installation... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm ${NPM_VERSION} found${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Install backend dependencies
echo ""
echo "Installing backend dependencies..."
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Check if .env exists
echo ""
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please edit .env and add your API keys${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Create necessary directories
echo ""
echo "Creating necessary directories..."
mkdir -p logs uploads generated generated/videos
echo -e "${GREEN}✓ Directories created${NC}"

# Ask about frontend setup
echo ""
read -p "Do you want to set up the frontend? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -d "frontend" ]; then
        echo "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    else
        echo -e "${YELLOW}⚠ Frontend directory not found${NC}"
    fi
fi

# Ask about Docker setup
echo ""
read -p "Do you have Docker installed and want to use Docker? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✓ Docker found${NC}"
        echo "You can start the application with: docker-compose up -d"
    else
        echo -e "${YELLOW}⚠ Docker not found${NC}"
        echo "Install Docker from https://www.docker.com/"
    fi
fi

# Summary
echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your API keys"
echo "2. Start the server with: npm start"
echo "   (or npm run dev for development)"
echo "3. Access the API at http://localhost:3000"
echo ""
echo "Optional:"
echo "- Start with Docker: docker-compose up -d"
echo "- Start frontend: cd frontend && npm start"
echo ""
echo "For more information, see README.md"
echo ""
