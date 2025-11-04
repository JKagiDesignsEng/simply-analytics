#!/bin/bash

# Simply Analytics Cleanup Script
# This script removes all containers, volumes, and generated files

echo "=========================================="
echo "    Simply Analytics Cleanup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning "This will completely remove your Simply Analytics installation!"
print_warning "This includes:"
print_warning "- All Docker containers and images"
print_warning "- All analytics data in the database"
print_warning "- SSL certificates"
print_warning "- Configuration files (.env)"
echo ""

read -p "Are you sure you want to continue? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    print_status "Cleanup cancelled."
    exit 0
fi

print_status "Stopping and removing Docker containers..."
docker compose down -v --remove-orphans

print_status "Removing Docker images..."
docker image rm simply-analytics-backend simply-analytics-frontend 2>/dev/null || true

print_status "Removing generated files..."
rm -f .env
rm -rf certbot/
rm -f nginx/nginx-backup.conf
rm -f nginx/nginx-temp.conf

print_status "Removing node_modules (if any)..."
rm -rf backend/node_modules
rm -rf frontend/node_modules

print_status "Cleanup completed successfully!"
echo ""
print_status "To reinstall, run: ./setup.sh"