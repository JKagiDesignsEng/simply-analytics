# Simply Analytics - Quick Reference

## 🚀 Setup Commands

```bash
# Initial setup (run once)
./setup.sh

# Complete cleanup and reset
./cleanup.sh
```

## 🐳 Docker Commands

```bash
# View all containers
docker compose ps

# View logs
docker compose logs
docker compose logs backend
docker compose logs frontend
docker compose logs nginx

# Restart services
docker compose restart
docker compose restart nginx

# Stop services
docker compose down

# Update and rebuild
git pull
docker compose up -d --build
```

## 🔧 Configuration

- **Main config**: `.env` file
- **Nginx config**: `nginx/nginx.conf`
- **SSL certificates**: `certbot/conf/live/[domain]/`

## 🌐 Default Endpoints

- **Main app**: `http://localhost` or `https://yourdomain.com`
- **Health check**: `http://localhost/health`
- **API**: `http://localhost:3000`
- **Frontend**: `http://localhost:3001`

## 🔐 SSL Management

```bash
# Renew certificates manually
docker compose run --rm certbot certbot renew

# Reload nginx after certificate renewal
docker compose exec nginx nginx -s reload

# Add to crontab for auto-renewal
0 12 * * * cd /path/to/simply-analytics && docker compose run --rm certbot certbot renew --quiet && docker compose exec nginx nginx -s reload
```

## 🛠️ Troubleshooting

### Check service status
```bash
docker compose ps
```

### View error logs
```bash
docker compose logs [service-name]
```

### Restart specific service
```bash
docker compose restart [service-name]
```

### Reset everything
```bash
./cleanup.sh
./setup.sh
```

## 📊 Adding Tracking to Your Website

Add this script tag to your website:

```html
<script async src="https://yourdomain.com/tracking.js" data-website="your-website-id"></script>
```

## 🆘 Support

For issues or questions:
1. Check the logs: `docker compose logs`
2. Verify all containers are running: `docker compose ps`
3. Check the health endpoint: `curl http://localhost/health`
4. Review the configuration in `.env`