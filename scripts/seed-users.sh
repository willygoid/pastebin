#!/bin/bash

# Script untuk membuat sample users untuk testing

echo "=== Creating Sample Users ==="
echo ""

# Create Admin User
echo "Creating admin user..."
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@pastebin.com",
    "password": "admin123",
    "full_name": "Admin User",
    "role": "admin"
  }' | jq

echo ""
echo "---"
echo ""

# Create Regular User 1
echo "Creating user1..."
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "email": "user1@pastebin.com",
    "password": "user123",
    "full_name": "John Doe",
    "role": "user"
  }' | jq

echo ""
echo "---"
echo ""

# Create Regular User 2
echo "Creating user2..."
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user2",
    "email": "user2@pastebin.com",
    "password": "user123",
    "full_name": "Jane Smith",
    "role": "user"
  }' | jq

echo ""
echo "---"
echo ""

# Create Regular User 3
echo "Creating user3..."
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user3",
    "email": "user3@pastebin.com",
    "password": "user123",
    "full_name": "Bob Johnson",
    "role": "user"
  }' | jq

echo ""
echo "================================"
echo "Sample users created successfully!"
echo ""
echo "Login credentials:"
echo "1. Admin:"
echo "   - Username: admin"
echo "   - Password: admin123"
echo ""
echo "2. Users (password for all: user123):"
echo "   - user1 (John Doe)"
echo "   - user2 (Jane Smith)"
echo "   - user3 (Bob Johnson)"
echo ""
echo "Login at: http://localhost/login"
