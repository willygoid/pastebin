#!/bin/bash

source .env

if [ -z "$1" ]; then
    echo "Usage: ./scripts/restore.sh backup_file.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

echo "📥 Restoring from $BACKUP_FILE..."

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE | docker-compose exec -T postgres psql -U $POSTGRES_USER $POSTGRES_DB
else
    cat $BACKUP_FILE | docker-compose exec -T postgres psql -U $POSTGRES_USER $POSTGRES_DB
fi

echo "✅ Restore complete"
