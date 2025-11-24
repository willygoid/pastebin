# Stop dan start ulang
docker-compose down
docker-compose up -d

# Tunggu semua service ready
sleep 10

# Test endpoints
echo "Testing backend health..."
curl http://localhost/api/health

echo "Testing frontend..."
curl http://localhost

# Check semua container running
docker-compose ps
