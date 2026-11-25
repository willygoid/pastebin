#!/bin/bash

echo "========================================="
echo "  PasteBin Quick Start Guide"
echo "========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ File .env tidak ditemukan!"
    echo "📝 Copying .env.example to .env..."
    cp .env.example .env
    echo "✅ File .env created!"
    echo ""
    echo "⚠️  PENTING: Edit file .env dan update nilai-nilai berikut:"
    echo "   - JWT_SECRET (wajib diubah untuk production)"
    echo "   - POSTGRES_PASSWORD"
    echo "   - REDIS_PASSWORD"
    echo ""
    read -p "Press Enter to continue after editing .env..."
fi

echo "1️⃣  Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker tidak terinstall!"
    echo "   Install Docker terlebih dahulu: https://www.docker.com/get-started"
    exit 1
fi
echo "✅ Docker found!"

echo ""
echo "2️⃣  Checking Docker Compose..."
if docker compose version > /dev/null 2>&1; then
    compose=(docker compose)
elif command -v docker-compose > /dev/null 2>&1; then
    compose=(docker-compose)
else
    echo "❌ Docker Compose tidak terinstall!"
    exit 1
fi
echo "✅ Docker Compose found (${compose[*]})!"

echo ""
echo "3️⃣  Building and starting containers..."
"${compose[@]}" up -d --build

echo ""
echo "4️⃣  Waiting for services to be ready..."
sleep 10

echo ""
echo "5️⃣  Checking container status..."
"${compose[@]}" ps

echo ""
echo "6️⃣  Checking backend health (via nginx, tanpa port host)..."
for i in {1..30}; do
    if "${compose[@]}" exec -T nginx wget -qO- http://localhost/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    echo "   Waiting for backend... ($i/30)"
    sleep 2
done

echo ""
echo "========================================="
echo "  🎉 Setup Complete!"
echo "========================================="
echo ""
echo "📍 Access Points:"
echo "   - Via Cloudflare Tunnel: https://<domain-tunnel>"
echo "   - Lokal (jika pakai docker-compose.local.yml): http://localhost:${NGINX_PORT:-8088}"
echo "   - Backend API: http://localhost:${NGINX_PORT:-8088}/api"
echo "   - Login Page: http://localhost:${NGINX_PORT:-8088}/login"
echo ""
echo "📝 Next Steps:"
echo "   1. Create sample users:"
echo "      ./scripts/seed-users.sh"
echo ""
echo "   2. Or create custom admin:"
echo "      ./scripts/create-admin.sh"
echo ""
echo "   3. Login at: http://localhost/login"
echo ""
echo "🔑 Default Credentials (after running seed-users.sh):"
echo "   Admin:"
echo "   - Username: admin"
echo "   - Password: admin123"
echo ""
echo "   User:"
echo "   - Username: user1"
echo "   - Password: user123"
echo ""
echo "📖 Documentation:"
echo "   - English: docs/authentication.md"
echo "   - Indonesian: docs/autentikasi.md"
echo ""
echo "🛑 To stop: ${compose[*]} down"
echo "🔄 To restart: ${compose[*]} restart"
echo "📋 To view logs: ${compose[*]} logs -f [service-name]"
echo ""
echo "========================================="
