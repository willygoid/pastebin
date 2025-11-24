#!/bin/bash

set -e

echo "🔄 Fresh start - resetting everything..."

# Stop containers
echo "⏹️  Stopping containers..."
docker-compose down

# Remove volumes
echo "🗑️  Removing volumes..."
docker-compose down -v

# Clean Docker system
echo "🧹 Cleaning Docker system..."
docker system prune -f

# Remove old images
echo "🗑️  Removing old images..."
docker-compose rm -f
docker rmi pastebin-app-backend pastebin-app-frontend pastebin-app-nginx 2>/dev/null || true

# Rebuild and start
echo "🏗️  Building and starting services..."
docker-compose up -d --build

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Check status
echo "📊 Service status:"
docker-compose ps

# Check backend logs
echo "📋 Backend logs:"
docker-compose logs --tail=30 backend

# Test health
echo "🏥 Health check:"
curl -s http://localhost/api/health | jq . || echo "Health check failed"

echo ""
echo "✅ Fresh start complete!"
echo "🌐 Open http://localhost in your browser"
