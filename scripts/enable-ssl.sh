#!/bin/bash

set -e

source .env

echo "🔐 Enabling SSL for $DOMAIN..."

# Ensure nginx is running
docker-compose up -d nginx
sleep 3

# Request certificate
echo "📜 Requesting SSL certificate..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d $DOMAIN_WWW

# Activate SSL config
echo "⚙️  Activating SSL configuration..."
cp nginx/conf.d/ssl.conf.example nginx/conf.d/ssl.conf
sed -i "s/yourdomain.com/$DOMAIN/g" nginx/conf.d/ssl.conf

# Remove HTTP-only config
rm -f nginx/conf.d/default.conf

# Reload nginx
docker-compose exec nginx nginx -s reload

echo "✅ SSL enabled successfully!"
echo "🌐 Your site: https://$DOMAIN"
