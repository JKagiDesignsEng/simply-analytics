# Simply Analytics

A professional, cookieless web analytics platform that respects user privacy while providing comprehensive insights into website performance. Built with modern technologies and designed to be lightweight, fast, and easy to deploy.

## ✨ Features

### 🔒 Privacy-First Analytics
- **Cookieless tracking** - No cookies, no tracking pixels, respects user privacy
- **GDPR compliant** - Collects only essential analytics data
- **Respects Do Not Track** - Automatically disables tracking when DNT is enabled
- **IP anonymization** - Geographic data without storing personal information

### 📊 Comprehensive Analytics
- **Real-time tracking** - Live visitor monitoring and analytics
- **Multi-website support** - Manage analytics for multiple domains
- **Detailed metrics** - Page views, unique visitors, session duration, bounce rate
- **Geographic insights** - Country-based visitor distribution
- **Technology tracking** - Browser, OS, and device analytics
- **Traffic sources** - Referrer and campaign tracking
- **Custom events** - Track button clicks, form submissions, downloads

### 🎨 Modern Dashboard
- **Mobile-responsive design** - Works perfectly on all devices
- **Colorful, professional UI** - Built with Tailwind CSS
- **Interactive charts** - Powered by Recharts for beautiful visualizations
- **Real-time updates** - Live data refresh without page reload
- **Dark/light theme support** - Automatic theme detection

### 🚀 Easy Deployment
- **Docker Compose** - One-command deployment
- **Automatic SSL** - Let's Encrypt integration with auto-renewal
- **Nginx reverse proxy** - Optimized for performance and security
- **Environment-based configuration** - Easy setup and customization

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │────│  React Frontend │────│  Express API    │
│   (SSL + CDN)   │    │   (Dashboard)   │    │   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         │              ┌─────────────────┐            │
         └──────────────│  Tracking Script │           │
                        │  (Cookieless JS) │           │
                        └─────────────────┘            │
                                                        │
                        ┌─────────────────┐            │
                        │  PostgreSQL DB  │────────────┘
                        │  (Analytics Data)│
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Domain name (for SSL in production)
- Basic command line knowledge

### 1. Clone and Setup
```bash
git clone <repository-url>
cd simply-analytics

# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

### 2. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit the .env file with your settings
nano .env
```

Required environment variables:
```env
# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here

# Database Configuration
POSTGRES_DB=analytics
POSTGRES_USER=analytics_user
POSTGRES_PASSWORD=your_db_password_here

# Application Configuration
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key_here

# SSL Configuration (for production)
DOMAIN=analytics.yourdomain.com
EMAIL=admin@yourdomain.com

# Database URL for application
DATABASE_URL=postgresql://analytics_user:your_db_password_here@postgres:5432/analytics
```

### 3. Start the Application
```bash
# For development (HTTP only)
docker-compose up --build

# For production (with SSL)
docker-compose up -d --build
./scripts/init-ssl.sh
```

### 4. Access Your Dashboard
- **Development**: http://localhost
- **Production**: https://your-domain.com

Login with the credentials set in your `.env` file.

## 📝 Adding Tracking to Your Website

Once your Simply Analytics instance is running, add this tracking code to your website:

```html
<!-- Simply Analytics Tracking Code -->
<script>
  window.SIMPLY_ANALYTICS_URL = 'https://your-domain.com';
</script>
<script src="https://your-domain.com/tracking.js" async defer></script>
```

### Custom Event Tracking

Track custom events (button clicks, form submissions, etc.):

```javascript
// Track a button click
sa.track('button_click', {
  button_text: 'Download PDF',
  page: '/products'
});

// Track form submission
sa.track('form_submit', {
  form_type: 'contact',
  success: true
});

// Track file download
sa.track('file_download', {
  filename: 'product-guide.pdf',
  file_size: '2.4MB'
});
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ADMIN_USERNAME` | Admin dashboard username | `admin` | Yes |
| `ADMIN_PASSWORD` | Admin dashboard password | - | Yes |
| `POSTGRES_DB` | Database name | `analytics` | Yes |
| `POSTGRES_USER` | Database username | `analytics_user` | Yes |
| `POSTGRES_PASSWORD` | Database password | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `NODE_ENV` | Environment mode | `production` | No |
| `DOMAIN` | Your domain name | - | Yes (production) |
| `EMAIL` | Let's Encrypt email | - | Yes (production) |

### Nginx Configuration

The Nginx configuration includes:
- **Automatic HTTP to HTTPS redirect**
- **Modern SSL/TLS settings**
- **Security headers** (HSTS, CSP, etc.)
- **Rate limiting** for API endpoints
- **Gzip compression**
- **Static file caching**
- **CORS headers** for tracking script

### Database Schema

The system uses PostgreSQL with the following main tables:
- `websites` - Tracked websites configuration
- `page_views` - Individual page view records
- `events` - Custom event tracking data

## 🔒 SSL Certificate Management

### Initial Setup
```bash
# Set up SSL certificates for production
./scripts/init-ssl.sh
```

### Automatic Renewal
Add to your crontab for automatic certificate renewal:
```bash
crontab -e

# Add this line for renewal every day at noon
0 12 * * * cd /path/to/simply-analytics && ./scripts/renew-ssl.sh
```

### Manual Renewal
```bash
./scripts/renew-ssl.sh
```

## 📊 API Documentation

### Authentication
All admin API endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token

#### Websites Management
- `GET /api/websites` - List all websites
- `POST /api/websites` - Add new website
- `DELETE /api/websites/:id` - Remove website

#### Analytics Data
- `GET /api/analytics/:websiteId/overview` - Overview statistics
- `GET /api/analytics/:websiteId/pages` - Top pages
- `GET /api/analytics/:websiteId/referrers` - Traffic sources
- `GET /api/analytics/:websiteId/technology` - Browser/OS data
- `GET /api/analytics/:websiteId/geography` - Geographic data
- `GET /api/analytics/:websiteId/events` - Custom events

#### Tracking (Public)
- `POST /api/track` - Record page views and events

## 🛠️ Development

### Local Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd simply-analytics

# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Access the application
# Frontend: http://localhost:3001
# Backend: http://localhost:3000
# Database: localhost:5432
```

### Project Structure
```
simply-analytics/
├── backend/                 # Express.js API server
│   ├── server.js           # Main server file
│   ├── init.sql            # Database initialization
│   ├── tracking.js         # Tracking script
│   └── package.json        # Backend dependencies
├── frontend/               # React dashboard
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API services
│   └── package.json        # Frontend dependencies
├── nginx/                  # Nginx configuration
│   └── nginx.conf          # Main nginx config
├── scripts/                # Utility scripts
│   ├── init-ssl.sh         # SSL setup script
│   └── renew-ssl.sh        # SSL renewal script
├── docker-compose.yml      # Production compose file
└── .env.example            # Environment template
```

### Technology Stack
- **Frontend**: React 18, React Router, React Query, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, PostgreSQL, JWT authentication
- **Infrastructure**: Docker, Nginx, Let's Encrypt
- **Analytics**: Custom cookieless tracking

## 🔐 Security Features

### Application Security
- **JWT-based authentication** with secure token handling
- **Rate limiting** on all API endpoints
- **Input validation** and sanitization
- **SQL injection protection** via parameterized queries
- **XSS protection** with security headers
- **CSRF protection** via SameSite cookies

### Infrastructure Security
- **Modern TLS configuration** (TLS 1.2+)
- **Security headers** (HSTS, CSP, X-Frame-Options)
- **Regular security updates** via Docker base images
- **Automated SSL certificate management**
- **Network isolation** via Docker networks

### Privacy Protection
- **No cookies** or persistent identifiers
- **Session-based tracking** only
- **IP anonymization** for geographic data
- **Do Not Track respect**
- **GDPR compliance** by design

## 📈 Performance Optimization

### Frontend Optimization
- **Code splitting** and lazy loading
- **Asset optimization** and compression
- **CDN-ready** static file serving
- **Mobile-first** responsive design
- **Progressive Web App** features

### Backend Optimization
- **Database indexing** for fast queries
- **Connection pooling** for PostgreSQL
- **Gzip compression** for API responses
- **Efficient data aggregation** queries
- **Rate limiting** to prevent abuse

### Infrastructure Optimization
- **Nginx reverse proxy** with caching
- **Static file serving** with long-term caching
- **Database query optimization**
- **Docker multi-stage builds** for smaller images

## 🚨 Troubleshooting

### Common Issues

#### SSL Certificate Issues
```bash
# Check certificate status
docker-compose exec certbot certbot certificates

# Renew certificates manually
docker-compose run --rm certbot certbot renew --force-renewal

# Check nginx configuration
docker-compose exec nginx nginx -t
```

#### Database Connection Issues
```bash
# Check database logs
docker-compose logs postgres

# Connect to database directly
docker-compose exec postgres psql -U analytics_user -d analytics

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### Tracking Script Issues
```bash
# Check if tracking script is accessible
curl https://your-domain.com/tracking.js

# Check tracking endpoint
curl -X POST https://your-domain.com/api/track \
  -H "Content-Type: application/json" \
  -d '{"domain":"test.com","path":"/test"}'
```

### Log Analysis
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Reporting Issues
Please use the GitHub issue tracker to report bugs or request features.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** and **Node.js** communities for excellent documentation
- **Let's Encrypt** for free SSL certificates
- **Docker** for containerization made easy
- **Tailwind CSS** for beautiful, responsive design
- **PostgreSQL** for reliable data storage

## 🔗 Links

- [Demo](https://demo.simply-analytics.com) - Live demo instance
- [Documentation](https://docs.simply-analytics.com) - Full documentation
- [GitHub](https://github.com/your-username/simply-analytics) - Source code
- [Docker Hub](https://hub.docker.com/r/your-username/simply-analytics) - Docker images

## 📧 Support

- **Email**: support@simply-analytics.com
- **GitHub Issues**: Use for bug reports and feature requests
- **Discord**: Join our community for discussions

---

**Simply Analytics** - Professional web analytics that respects privacy 🚀