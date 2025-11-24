#!/bin/bash

set -e

echo "🚀 Setting up Pastebin application..."

# Setup backend
echo "📦 Setting up backend..."
cd backend
if [ ! -f "go.sum" ]; then
    echo "Generating go.sum..."
    go mod download
    go mod tidy
fi
cd ..

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend
if [ ! -f "package-lock.json" ]; then
    echo "Generating package-lock.json..."
    npm install
fi
cd ..

echo "✅ Setup complete!"
echo "Run: docker-compose up -d --build"
