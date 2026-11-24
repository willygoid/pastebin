#!/bin/bash

# Database Reset and Seed Script
# This script resets the database and seeds default accounts

echo "========================================="
echo "Database Reset & Seed Script"
echo "========================================="
echo ""
echo "This will:"
echo "1. Drop all tables"
echo "2. Recreate tables"
echo "3. Seed default admin and user accounts"
echo ""
echo "WARNING: All data will be lost!"
echo "Press CTRL+C to cancel, or Enter to continue..."
read

echo ""
echo "Connecting to database container..."

# Drop and recreate tables via SQL
docker-compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB <<-EOSQL
	-- Drop existing tables
	DROP TABLE IF EXISTS users CASCADE;
	DROP TABLE IF EXISTS pastes CASCADE;
	
	-- Recreate tables will be done by backend AutoMigrate
EOSQL

echo "✓ Tables dropped"

# Restart backend to trigger AutoMigrate
echo "Restarting backend to recreate tables..."
docker-compose restart backend
sleep 5

echo "✓ Tables recreated via GORM AutoMigrate"

# Seed default accounts via SQL
echo "Seeding default accounts..."

docker-compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB <<-EOSQL
	-- Insert admin user (password: admin123)
	INSERT INTO users (username, email, password, full_name, role, is_active, created_at, updated_at)
	VALUES (
		'admin',
		'admin@pastebin.com',
		'\$2a\$10\$YourHashedPasswordHere',
		'System Administrator',
		'admin',
		true,
		NOW(),
		NOW()
	) ON CONFLICT (email) DO NOTHING;
	
	-- Insert regular user (password: user123)
	INSERT INTO users (username, email, password, full_name, role, is_active, created_at, updated_at)
	VALUES (
		'testuser',
		'user@pastebin.com',
		'\$2a\$10\$YourHashedPasswordHere2',
		'Test User',
		'user',
		true,
		NOW(),
		NOW()
	) ON CONFLICT (email) DO NOTHING;
EOSQL

echo "✓ Default accounts seeded"
echo ""
echo "========================================="
echo "Database reset completed!"
echo "========================================="
echo ""
echo "Default Accounts:"
echo "  Admin:"
echo "    Email: admin@pastebin.com"
echo "    Password: admin123"
echo ""
echo "  User:"
echo "    Email: user@pastebin.com"
echo "    Password: user123"
echo ""
