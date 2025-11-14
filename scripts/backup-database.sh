#!/bin/bash

###############################################################################
# Database Backup Script
# 
# Creates a backup of the MongoDB database
# 
# Usage: ./scripts/backup-database.sh
###############################################################################

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
BACKUP_DIR="./backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="krishiraksha_backup_$DATE"
RETENTION_DAYS=7

echo "📦 Starting database backup..."
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Perform backup
echo "Backing up to: $BACKUP_DIR/$BACKUP_NAME"
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$BACKUP_NAME"

# Compress backup
echo "Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"
cd - > /dev/null

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
echo "Backup size: $BACKUP_SIZE"

# Clean old backups
echo "Cleaning old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

# List recent backups
echo ""
echo "Recent backups:"
ls -lh "$BACKUP_DIR" | tail -5

echo ""
echo "✅ Backup completed successfully!"
echo "Backup location: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
