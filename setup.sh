#!/bin/bash

# Simply Analytics Setup Script
# This script sets up the complete Simply Analytics application

set -e

echo "=========================================="
echo "    Simply Analytics Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons."
   print_error "Please run as a regular user with sudo privileges."
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_header "=== Step 1: Environment Configuration ==="

# Check if .env already exists
if [[ -f .env ]]; then
    echo ""
    print_warning ".env file already exists!"
    read -p "Do you want to overwrite existing values? [y/N]: " OVERWRITE_ENV
    if [[ ! "$OVERWRITE_ENV" =~ ^[Yy]$ ]]; then
        print_status "Using existing .env file. Skipping configuration."
        print_status "If you need to reconfigure, delete .env and run this script again."
        echo ""
        
        # Load existing .env
        set -a
        source .env
        set +a
        
        # Skip to service startup
        SKIP_CONFIG=true
    else
        print_status "Will overwrite existing configuration."
        SKIP_CONFIG=false
    fi
else
    SKIP_CONFIG=false
fi

if [[ "$SKIP_CONFIG" == "false" ]]; then
    # Get environment variables from user
    echo ""
    print_status "Please provide the following configuration details:"
    echo ""
fi

if [[ "$SKIP_CONFIG" == "false" ]]; then
    # Admin credentials
    read -p "Enter admin username [admin]: " ADMIN_USERNAME
    ADMIN_USERNAME=${ADMIN_USERNAME:-admin}

    while true; do
        read -s -p "Enter admin password (minimum 8 characters): " ADMIN_PASSWORD
        echo
        if [[ ${#ADMIN_PASSWORD} -ge 8 ]]; then
            break
        else
            print_error "Password must be at least 8 characters long."
        fi
    done

    # Database configuration
    read -p "Enter database name [analytics]: " POSTGRES_DB
    POSTGRES_DB=${POSTGRES_DB:-analytics}

    read -p "Enter database username [analytics_user]: " POSTGRES_USER
    POSTGRES_USER=${POSTGRES_USER:-analytics_user}

    while true; do
        read -s -p "Enter database password (minimum 8 characters): " POSTGRES_PASSWORD
        echo
        if [[ ${#POSTGRES_PASSWORD} -ge 8 ]]; then
            break
        else
            print_error "Database password must be at least 8 characters long."
        fi
    done

    # JWT Secret
    JWT_SECRET=$(openssl rand -base64 32)
    print_status "Generated secure JWT secret."

    # Domain configuration
    echo ""
    print_status "Domain Configuration:"
    echo "If you have a domain pointing to this server, enter it below."
    echo "Otherwise, you can use 'localhost' for local testing."
    echo ""

    read -p "Enter your domain name [localhost]: " DOMAIN
    DOMAIN=${DOMAIN:-localhost}

    if [[ "$DOMAIN" != "localhost" ]]; then
        read -p "Enter email for SSL certificates: " EMAIL
        if [[ -z "$EMAIL" ]]; then
            print_error "Email is required for SSL certificates."
            exit 1
        fi
    else
        EMAIL="admin@localhost"
    fi

    # Port configuration
    read -p "Enter API port [3000]: " API_PORT
    API_PORT=${API_PORT:-3000}

    read -p "Enter frontend port [3001]: " CLIENT_PORT
    CLIENT_PORT=${CLIENT_PORT:-3001}

    # Environment selection
    echo ""
    read -p "Is this a production environment? [y/N]: " IS_PRODUCTION
    if [[ "$IS_PRODUCTION" =~ ^[Yy]$ ]]; then
        NODE_ENV="production"
        REACT_APP_API_URL=""
    else
        NODE_ENV="development"
        REACT_APP_API_URL="http://localhost:${API_PORT}"
    fi
fi

if [[ "$SKIP_CONFIG" == "false" ]]; then
    print_header "=== Step 2: Creating Configuration Files ==="

    # Create .env file
    cat > .env << EOF
# Simply Analytics Configuration

# Admin Credentials
ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD=${ADMIN_PASSWORD}

# Database Configuration
POSTGRES_DB=${POSTGRES_DB}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Application Configuration
NODE_ENV=${NODE_ENV}
JWT_SECRET=${JWT_SECRET}
API_PORT=${API_PORT}
CLIENT_PORT=${CLIENT_PORT}
REACT_APP_API_URL=${REACT_APP_API_URL}

# SSL Configuration
DOMAIN=${DOMAIN}
EMAIL=${EMAIL}

# Database URL for application
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
EOF

    print_status "Created .env configuration file."

    # Set proper permissions
    chmod 600 .env
    print_status "Set secure permissions on .env file."
else
    print_header "=== Step 2: Using Existing Configuration ==="
    print_status "Skipping .env file creation."
fi

print_header "=== Step 3: Preparing SSL Configuration ==="

# Create necessary directories
mkdir -p certbot/www
mkdir -p certbot/conf
mkdir -p nginx/ssl

print_status "Created SSL directories."

if [[ "$DOMAIN" != "localhost" ]]; then
    print_status "Domain detected: $DOMAIN"
    print_status "Will attempt to obtain SSL certificates from Let's Encrypt."
    
    # Create temporary nginx config for certificate acquisition
    cp nginx/nginx.conf.template nginx/nginx-backup.conf
    
    # Create HTTP-only nginx config for initial certificate request
    cat > nginx/nginx-temp.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Basic settings
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout 65;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=tracking:10m rate=100r/s;

    # Upstream backend
    upstream backend {
        server backend:3000;
    }

    # Upstream frontend
    upstream frontend {
        server frontend:3000;
    }

    # HTTP server for Let's Encrypt and temporary access
    server {
        listen 80;
        server_name _;
        
        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Temporary frontend access
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

    cp nginx/nginx-temp.conf nginx/nginx.conf.template
    print_status "Created temporary nginx configuration for certificate acquisition."
else
    print_status "Using localhost - skipping SSL certificate setup."
fi

print_header "=== Step 4: Building and Starting Services ==="

# Build and start containers
print_status "Building Docker containers..."
docker compose build

print_status "Starting services..."
docker compose up -d

# Wait for services to start
print_status "Waiting for services to initialize..."
sleep 30

# Check if services are running
print_status "Checking service health..."

POSTGRES_RUNNING=$(docker compose ps postgres --format json | jq -r '.State' 2>/dev/null || echo "unknown")
BACKEND_RUNNING=$(docker compose ps backend --format json | jq -r '.State' 2>/dev/null || echo "unknown")
FRONTEND_RUNNING=$(docker compose ps frontend --format json | jq -r '.State' 2>/dev/null || echo "unknown")

if [[ "$POSTGRES_RUNNING" != "running" ]]; then
    print_error "PostgreSQL container is not running properly."
    docker compose logs postgres --tail 20
    exit 1
fi

if [[ "$BACKEND_RUNNING" != "running" ]]; then
    print_error "Backend container is not running properly."
    docker compose logs backend --tail 20
    exit 1
fi

if [[ "$FRONTEND_RUNNING" != "running" ]]; then
    print_error "Frontend container is not running properly."
    docker compose logs frontend --tail 20
    exit 1
fi

print_status "All core services are running."

print_header "=== Step 5: Running Database Migrations ==="

# Wait a bit more to ensure PostgreSQL is fully ready
print_status "Waiting for database to be fully ready..."
sleep 10

# Run migrations
print_status "Running database migrations..."

# Check if migration files exist
if [[ -f "backend/migrations/add_enhanced_metrics.sql" ]]; then
    print_status "Applying migration: add_enhanced_metrics.sql"
    if docker compose exec -T postgres psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} < backend/migrations/add_enhanced_metrics.sql; then
        print_status "✓ Migration add_enhanced_metrics.sql applied successfully."
    else
        print_error "Failed to apply migration: add_enhanced_metrics.sql"
        print_warning "Continuing anyway - the migration might have already been applied."
    fi
else
    print_warning "Migration file not found: backend/migrations/add_enhanced_metrics.sql"
fi

if [[ -f "backend/migrations/enable_enhanced_tracking.sql" ]]; then
    print_status "Applying migration: enable_enhanced_tracking.sql"
    if docker compose exec -T postgres psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} < backend/migrations/enable_enhanced_tracking.sql; then
        print_status "✓ Migration enable_enhanced_tracking.sql applied successfully."
    else
        print_error "Failed to apply migration: enable_enhanced_tracking.sql"
        print_warning "Continuing anyway - the migration might have already been applied."
    fi
else
    print_warning "Migration file not found: backend/migrations/enable_enhanced_tracking.sql"
fi

print_status "Database migrations completed."

print_header "=== Step 6: SSL Certificate Setup ==="

if [[ "$DOMAIN" != "localhost" ]]; then
    print_status "Attempting to obtain SSL certificates for $DOMAIN..."
    
    # Try to get SSL certificate
    if docker compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --keep-until-expiring \
        -d $DOMAIN; then
        
        print_status "SSL certificate obtained successfully!"
        
        # Restore full nginx configuration
        cp nginx/nginx-backup.conf nginx/nginx.conf.template
        
        # Restart nginx with SSL configuration (domain will be substituted via env vars)
        docker compose restart nginx
        
        # Wait for nginx to restart
        sleep 10
        
        print_status "SSL configuration applied successfully."
    else
        print_warning "Failed to obtain SSL certificate."
        print_warning "This might be because:"
        print_warning "1. The domain $DOMAIN is not pointing to this server"
        print_warning "2. Port 80 is not accessible from the internet"
        print_warning "3. There might be a firewall blocking the connection"
        print_warning ""
        print_warning "The application will continue to run on HTTP."
        
        # Keep HTTP-only configuration
        print_status "Continuing with HTTP-only configuration."
    fi
else
    print_status "Using localhost - SSL setup skipped."
fi

print_header "=== Step 7: Final Health Check ==="

# Test application health
sleep 5

if curl -f -s http://localhost/health > /dev/null; then
    print_status "Application health check passed!"
else
    print_error "Application health check failed."
    print_error "Please check the logs with: docker compose logs"
    exit 1
fi

# Test API endpoint
if curl -f -s -X POST http://localhost/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}" > /dev/null; then
    print_status "API authentication test passed!"
else
    print_warning "API test failed - this might be normal if database is still initializing."
fi

print_header "=== Setup Complete! ==="
echo ""
print_status "Simply Analytics has been successfully set up!"
echo ""
echo "Access your application at:"
if [[ "$DOMAIN" != "localhost" ]]; then
    if [[ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]]; then
        echo "  🔒 https://$DOMAIN (with SSL)"
        echo "  🌐 http://$DOMAIN (redirects to HTTPS)"
    else
        echo "  🌐 http://$DOMAIN"
    fi
else
    echo "  🌐 http://localhost"
fi
echo ""
echo "Admin Login:"
echo "  Username: $ADMIN_USERNAME"
echo "  Password: [as configured]"
echo ""
echo "Additional endpoints:"
echo "  📊 API: http://localhost:$API_PORT"
echo "  🖥️  Frontend: http://localhost:$CLIENT_PORT"
echo "  ❤️  Health Check: http://localhost/health"
echo ""
echo "Useful commands:"
echo "  📋 View logs: docker compose logs"
echo "  🔄 Restart: docker compose restart"
echo "  🛑 Stop: docker compose down"
echo "  🔧 Update: git pull && docker compose up -d --build"
echo ""

if [[ "$DOMAIN" != "localhost" && -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]]; then
    echo "SSL Certificate Auto-Renewal:"
    echo "Add this to your crontab (crontab -e):"
    echo "0 12 * * * cd $(pwd) && docker compose run --rm certbot certbot renew --quiet && docker compose exec nginx nginx -s reload"
    echo ""
fi

print_status "Setup completed successfully! 🎉"