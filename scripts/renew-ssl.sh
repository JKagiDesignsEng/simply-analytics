#!/bin/bash

# Certificate Renewal Script for Simply Analytics
# This script renews SSL certificates and reloads nginx

set -e

echo "Renewing SSL certificates..."

# Renew certificates
docker-compose run --rm certbot certbot renew --quiet

# Reload nginx to use renewed certificates
docker-compose exec nginx nginx -s reload

echo "Certificate renewal completed successfully!"

# Log the renewal
echo "$(date): Certificates renewed" >> logs/ssl-renewal.log