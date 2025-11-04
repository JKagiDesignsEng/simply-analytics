#!/bin/bash

# SSL Certificate Initialization Script for Simply Analytics
# This script obtains SSL certificates using Let's Encrypt

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Check if domain and email are set
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Error: DOMAIN and EMAIL must be set in .env file"
    echo "Example:"
    echo "DOMAIN=analytics.yourdomain.com"
    echo "EMAIL=admin@yourdomain.com"
    exit 1
fi

echo "Initializing SSL certificates for domain: $DOMAIN"
echo "Email: $EMAIL"

# Create required directories
mkdir -p certbot/www
mkdir -p certbot/conf
mkdir -p nginx/ssl

# Download recommended TLS parameters
if [ ! -f "nginx/ssl/options-ssl-nginx.conf" ]; then
    echo "Downloading recommended TLS parameters..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > nginx/ssl/options-ssl-nginx.conf
fi

if [ ! -f "nginx/ssl/ssl-dhparams.pem" ]; then
    echo "Downloading SSL DH parameters..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > nginx/ssl/ssl-dhparams.pem
fi

# Check if certificate already exists
if [ -d "certbot/conf/live/$DOMAIN" ]; then
    echo "Certificate for $DOMAIN already exists."
    echo "To renew, run: docker-compose exec certbot certbot renew"
    exit 0
fi

# Create dummy certificate for nginx to start
echo "Creating dummy certificate for $DOMAIN..."
mkdir -p "certbot/conf/live/$DOMAIN"

cat > "certbot/conf/live/$DOMAIN/fullchain.pem" << EOF
-----BEGIN CERTIFICATE-----
MIIBkTCB+wIJANIFR8jCn0+2MA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNVBAMMCWxv
Y2FsaG9zdDAeFw0yMzEwMDEwMDAwMDBaFw0yNDEwMDEwMDAwMDBaMBQxEjAQBgNV
BAMMCWxvY2FsaG9zdDBcMA0GCSqGSIb3DQEBAQUAA0sAMEgCQQC7j7u8j4nq+wAt
-----END CERTIFICATE-----
EOF

cat > "certbot/conf/live/$DOMAIN/privkey.pem" << EOF
-----BEGIN PRIVATE KEY-----
MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAu4+7vI+J6vsALY3Q
-----END PRIVATE KEY-----
EOF

echo "Starting nginx with dummy certificate..."

# Start nginx
docker-compose up -d nginx

echo "Waiting for nginx to start..."
sleep 10

# Request the real certificate
echo "Requesting Let's Encrypt certificate for $DOMAIN..."

docker-compose run --rm certbot certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN

if [ $? -eq 0 ]; then
    echo "Certificate obtained successfully!"
    
    # Reload nginx to use the real certificate
    docker-compose exec nginx nginx -s reload
    
    echo "SSL setup complete!"
    echo ""
    echo "Your Simply Analytics instance is now available at:"
    echo "https://$DOMAIN"
    echo ""
    echo "To set up automatic renewal, add this to your crontab:"
    echo "0 12 * * * cd $(pwd) && docker-compose run --rm certbot certbot renew --quiet && docker-compose exec nginx nginx -s reload"
else
    echo "Certificate request failed!"
    echo "Please check your domain configuration and try again."
    exit 1
fi