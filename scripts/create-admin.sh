#!/bin/bash

# Script untuk membuat user admin pertama kali

echo "=== Create First Admin User ==="
echo ""

# Prompt for admin details
read -p "Username: " USERNAME
read -p "Email: " EMAIL
read -p "Full Name: " FULLNAME
read -sp "Password: " PASSWORD
echo ""

# Create admin user via API
RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/register \
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
echo "You can now login at: http://localhost/login"
