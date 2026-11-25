#!/bin/bash

set -e

source .env

if docker compose version > /dev/null 2>&1; then
    compose=(docker compose)
elif command -v docker-compose > /dev/null 2>&1; then
    compose=(docker-compose)
else
    echo "❌ Docker Compose tidak ditemukan!"
    exit 1
fi

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/pastebin_backup_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup..."
"${compose[@]}" exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_FILE"

echo "✅ Backup created: $BACKUP_FILE"
gzip "$BACKUP_FILE"
echo "✅ Compressed to: $BACKUP_FILE.gz"

# Keep only last 7 backups
ls -t "$BACKUP_DIR"/*.sql.gz | tail -n +8 | xargs -r rm -f
echo "✅ Old backups cleaned"
