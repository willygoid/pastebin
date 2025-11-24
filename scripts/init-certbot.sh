#!/bin/bash

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "🔐 Initializing SSL certificates for $DOMAIN"

# Create directories
mkdir -p ./nginx/certbot/conf
mkdir -p ./nginx/certbot/www

# Start nginx
echo "🚀 Starting nginx..."
docker-compose up -d nginx
sleep 5

# Request certificate
echo "📜 Requesting SSL certificate..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN \
    -d $DOMAIN_WWW

# Reload nginx
echo "♻️  Reloading nginx..."
docker-compose exec nginx nginx -s reload

echo "✅ SSL certificates installed successfully!"
echo "🌐 Your site should now be available at https://$DOMAIN"
