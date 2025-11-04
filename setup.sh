#!/bin/bash

# Create directories
mkdir -p nginx ssl certbot/www certbot/conf backend frontend

# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from .env.example"
    echo "Please edit .env file with your configuration before running docker-compose up"
fi

# Make the script executable
chmod +x scripts/init-ssl.sh

echo "Project structure created successfully!"
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'docker-compose up --build' to start the application"
echo "3. For SSL in production, run './scripts/init-ssl.sh' after the containers are up"