#!/bin/bash

# RTRWH Production Deployment Script
set -e

echo "🚀 Starting RTRWH Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    print_warning "No .env file found. Creating from template..."
    cp env.example .env
    print_warning "Please edit .env file with your production settings before continuing."
    read -p "Press Enter to continue after editing .env file..."
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

print_status "Environment: $NODE_ENV"
print_status "Backend Port: $PORT"
print_status "Frontend Port: $VITE_PORT"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start services
print_status "Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Health checks
print_status "Performing health checks..."

# Check backend health
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    print_status "✅ Backend is healthy"
else
    print_error "❌ Backend health check failed"
    docker-compose logs backend
    exit 1
fi

# Check frontend health
if curl -f http://localhost:5173 > /dev/null 2>&1; then
    print_status "✅ Frontend is healthy"
else
    print_error "❌ Frontend health check failed"
    docker-compose logs frontend
    exit 1
fi

# Check nginx health
if curl -f http://localhost:80 > /dev/null 2>&1; then
    print_status "✅ Nginx is healthy"
else
    print_warning "⚠️ Nginx health check failed (may not be configured)"
fi

# Show running containers
print_status "Running containers:"
docker-compose ps

# Show logs
print_status "Recent logs:"
docker-compose logs --tail=20

print_status "🎉 Deployment completed successfully!"
print_status "🌐 Application is available at:"
print_status "   - Frontend: http://localhost:80"
print_status "   - Backend API: http://localhost:4000"
print_status "   - Health Check: http://localhost:4000/health"

print_status "📊 To view logs: docker-compose logs -f"
print_status "🛑 To stop: docker-compose down"
print_status "🔄 To restart: docker-compose restart"

# Optional: Set up monitoring
if [ "$ENABLE_METRICS" = "true" ]; then
    print_status "📈 Metrics endpoint: http://localhost:9090"
fi
