#!/bin/bash

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found!"
    exit 1
fi

echo "⚠️  WARNING: This will delete all data in database: $POSTGRES_DB"
read -p "Are you sure you want to reset the database? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo "🗑️  Resetting database..."

# Check if postgres container is running
if ! docker-compose ps | grep -q "postgres.*Up"; then
    echo "❌ PostgreSQL container is not running!"
    echo "Starting containers..."
    docker-compose up -d postgres
    sleep 5
fi

# Drop all tables instead of dropping database
echo "Dropping all tables..."
docker-compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" << EOF
-- Drop all tables
DROP TABLE IF EXISTS pastes CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Confirm
SELECT 'Database cleared successfully' as status;
EOF

echo "✅ Database cleared!"

# Restart backend to run migrations
echo "🔄 Restarting backend to apply migrations..."
docker-compose restart backend

echo "⏳ Waiting for backend to start..."
sleep 8

echo "📋 Backend logs:"
docker-compose logs --tail=25 backend

echo ""
echo "✅ Database reset complete!"
echo "🧪 Test with: curl http://localhost/api/health"
