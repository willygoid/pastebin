#!/bin/bash

# Script untuk membuat user admin pertama kali
# Membutuhkan akses lokal lewat docker-compose.local.yml (nginx di NGINX_PORT).

set -e
source .env
API_BASE="${API_BASE_URL:-http://localhost:${NGINX_PORT:-8088}}"

echo "=== Create First Admin User ==="
echo ""

# Prompt for admin details
read -p "Username: " USERNAME
read -p "Email: " EMAIL
read -p "Full Name: " FULLNAME
read -sp "Password: " PASSWORD
echo ""

# Create admin user via API
RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"full_name\": \"$FULLNAME\",
    \"role\": \"admin\"
  }")

echo ""
echo "Response: $RESPONSE"
echo ""
echo "Admin user created successfully!"
echo "You can now login at: $API_BASE/login"
