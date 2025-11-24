#!/bin/bash

source .env

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/pastebin_backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "📦 Creating backup..."
docker-compose exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup created: $BACKUP_FILE"
    
    # Compress backup
    gzip $BACKUP_FILE
    echo "✅ Compressed to: $BACKUP_FILE.gz"
    
    # Keep only last 7 backups
    ls -t $BACKUP_DIR/*.sql.gz | tail -n +8 | xargs rm -f
    echo "✅ Old backups cleaned"
else
    echo "❌ Backup failed"
fi
