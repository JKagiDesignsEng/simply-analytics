const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const http = require('http');
const WebSocket = require('ws');
const querystring = require('querystring');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // Trust proxy for rate limiting with X-Forwarded-For
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const clients = new Map();

// Middleware
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
    cors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Tracking rate limiting (more permissive)
const trackingLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 tracking requests per minute
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Helper function to get client IP
const getClientIP = (req) => {
    return (
        req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null)
    );
};

// Helper function to parse user agent
const parseUserAgent = (userAgent) => {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
        browser: result.browser.name || 'Unknown',
        os: result.os.name || 'Unknown',
        device_type: result.device.type || 'desktop',
    };
};

// Routes

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Admin login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (
            username === process.env.ADMIN_USERNAME &&
            password === process.env.ADMIN_PASSWORD
        ) {
            const token = jwt.sign(
                { username, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ token, user: { username, role: 'admin' } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Tracking endpoint (cookieless)
app.post('/api/track', trackingLimiter, async (req, res) => {
    try {
        const {
            websiteId,
            domain,
            path,
            referrer,
            sessionId,
            screenWidth,
            screenHeight,
            duration,
            eventName,
            eventData,
        } = req.body;

        if (!path) {
            return res
                .status(400)
                .json({ error: 'Path is required' });
        }

        // Use provided websiteId or get/create website by domain
        let finalWebsiteId = websiteId;
        
        if (!finalWebsiteId && domain) {
            let website = await pool.query(
                'SELECT id FROM websites WHERE domain = $1',
                [domain]
            );

            if (website.rows.length === 0) {
                website = await pool.query(
                    'INSERT INTO websites (name, domain) VALUES ($1, $2) RETURNING id',
                    [domain, domain]
                );
            }
            finalWebsiteId = website.rows[0].id;
        }

        if (!finalWebsiteId) {
            return res.status(400).json({ error: 'Website ID or domain is required' });
        }
        const ip = getClientIP(req);
        const userAgent = req.headers['user-agent'] || '';
        const { browser, os, device_type } = parseUserAgent(userAgent);

        // Get country from IP
        const geo = geoip.lookup(ip);
        const country = geo ? geo.country : null;

        // Extract additional fields from request body
        const {
            viewportWidth,
            viewportHeight,
            colorDepth,
            pixelRatio,
            language,
            timezone,
            timezoneOffset,
            connection,
            performance: perfMetrics,
        } = req.body;

        // Track page view
        if (!eventName) {
            await pool.query(
                `
        INSERT INTO page_views (
          website_id, session_id, path, referrer, user_agent, ip_address,
          country, browser, os, device_type, screen_width, screen_height, duration,
          viewport_width, viewport_height, color_depth, pixel_ratio,
          language, timezone, timezone_offset,
          connection_type, connection_downlink, connection_rtt,
          load_time, dom_content_loaded, first_paint, first_contentful_paint
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      `,
                [
                    finalWebsiteId,
                    sessionId,
                    path,
                    referrer,
                    userAgent,
                    ip,
                    country,
                    browser,
                    os,
                    device_type,
                    screenWidth,
                    screenHeight,
                    duration,
                    viewportWidth,
                    viewportHeight,
                    colorDepth,
                    pixelRatio,
                    language,
                    timezone,
                    timezoneOffset,
                    connection?.effectiveType,
                    connection?.downlink,
                    connection?.rtt,
                    perfMetrics?.loadTime,
                    perfMetrics?.domContentLoaded,
                    perfMetrics?.firstPaint,
                    perfMetrics?.firstContentfulPaint,
                ]
            );
        } else {
            // Track custom event
            await pool.query(
                `
        INSERT INTO events (website_id, session_id, event_name, event_data, path)
        VALUES ($1, $2, $3, $4, $5)
      `,
                [finalWebsiteId, sessionId, eventName, eventData, path]
            );
        }

        if (clients.has(finalWebsiteId)) {
            const updateMessage = JSON.stringify({ type: eventName ? 'event' : 'pageview', data: req.body });
            clients.get(finalWebsiteId).forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(updateMessage);
                }
            });
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get websites
app.get('/api/websites', authenticateToken, async (_req, res) => {
    try {
        const result = await pool.query(`
      SELECT w.*, 
             COUNT(DISTINCT pv.id) as total_views,
             COUNT(DISTINCT pv.session_id) as unique_sessions
      FROM websites w
      LEFT JOIN page_views pv ON w.id = pv.website_id
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching websites:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add website
app.post('/api/websites', authenticateToken, async (req, res) => {
    try {
        const { name, domain } = req.body;

        if (!name || !domain) {
            return res
                .status(400)
                .json({ error: 'Name and domain are required' });
        }

        const result = await pool.query(
            'INSERT INTO websites (name, domain) VALUES ($1, $2) RETURNING *',
            [name, domain]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            // Unique violation
            res.status(400).json({ error: 'Domain already exists' });
        } else {
            console.error('Error creating website:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Update website
app.put('/api/websites/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const result = await pool.query(
            'UPDATE websites SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Website not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating website:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete website
app.delete('/api/websites/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM websites WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Website not found' });
        }

        res.json({ message: 'Website deleted successfully' });
    } catch (error) {
        console.error('Error deleting website:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Analytics endpoints
app.get(
    '/api/analytics/:websiteId/overview',
    authenticateToken,
    async (req, res) => {
        try {
            const { websiteId } = req.params;
            const { period = '7d' } = req.query;

            // Calculate date range
            const days =
                period === '1d'
                    ? 1
                    : period === '7d'
                    ? 7
                    : period === '30d'
                    ? 30
                    : 7;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            // Get overview stats
            const stats = await pool.query(
                `
      SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT session_id) as unique_visitors,
        COUNT(DISTINCT path) as unique_pages,
        AVG(duration) as avg_duration
      FROM page_views 
      WHERE website_id = $1 AND timestamp >= $2
    `,
                [websiteId, startDate]
            );

            // Get daily stats for chart
            const dailyStats = await pool.query(
                `
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as visitors
      FROM page_views 
      WHERE website_id = $1 AND timestamp >= $2
      GROUP BY DATE(timestamp)
      ORDER BY date
    `,
                [websiteId, startDate]
            );

            res.json({
                overview: stats.rows[0],
                daily: dailyStats.rows,
            });
        } catch (error) {
            console.error('Error fetching analytics overview:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// Top pages
app.get(
    '/api/analytics/:websiteId/pages',
    authenticateToken,
    async (req, res) => {
        try {
            const { websiteId } = req.params;
            const { period = '7d' } = req.query;

            const days =
                period === '1d'
                    ? 1
                    : period === '7d'
                    ? 7
                    : period === '30d'
                    ? 30
                    : 7;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const result = await pool.query(
                `
      SELECT 
        path,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_visitors,
        AVG(duration) as avg_duration
      FROM page_views 
      WHERE website_id = $1 AND timestamp >= $2
      GROUP BY path
      ORDER BY views DESC
      LIMIT 20
    `,
                [websiteId, startDate]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching page analytics:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// Referrers
app.get(
    '/api/analytics/:websiteId/referrers',
    authenticateToken,
    async (req, res) => {
        try {
            const { websiteId } = req.params;
            const { period = '7d' } = req.query;

            const days =
                period === '1d'
                    ? 1
                    : period === '7d'
                    ? 7
                    : period === '30d'
                    ? 30
                    : 7;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const result = await pool.query(
                `
      SELECT 
        CASE 
          WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
          ELSE referrer
        END as referrer,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM page_views 
      WHERE website_id = $1 AND timestamp >= $2
      GROUP BY referrer
      ORDER BY views DESC
      LIMIT 20
    `,
                [websiteId, startDate]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching referrer analytics:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// Browser/OS stats
app.get(
    '/api/analytics/:websiteId/technology',
    authenticateToken,
    async (req, res) => {
        try {
            const { websiteId } = req.params;
            const { period = '7d' } = req.query;

            const days =
                period === '1d'
                    ? 1
                    : period === '7d'
                    ? 7
                    : period === '30d'
                    ? 30
                    : 7;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const browsers = await pool.query(
                `
      SELECT 
        browser,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM page_views 
      WHERE website_id = $1 AND timestamp >= $2
      GROUP BY browser
      ORDER BY views DESC
      LIMIT 10
    `,
                [websiteId, startDate]
            );

            const os = await pool.query(
                `
      SELECT 
        os,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM page_views 
      WHERE website_id = $1 AND timestamp >= $2
      GROUP BY os
      ORDER BY views DESC
      LIMIT 10
    `,
                [websiteId, startDate]
            );

            const devices = await pool.query(
                `
      SELECT 
        device_type,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM page_views 
      WHERE website_id = $1 AND timestamp >= $2
      GROUP BY device_type
      ORDER BY views DESC
    `,
                [websiteId, startDate]
            );

            res.json({
                browsers: browsers.rows,
                os: os.rows,
                devices: devices.rows,
            });
        } catch (error) {
            console.error('Error fetching technology analytics:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// Geographic data
app.get(
    '/api/analytics/:websiteId/geography',
    authenticateToken,
    async (req, res) => {
        try {
            const { websiteId } = req.params;
            const { period = '7d' } = req.query;

            const days =
                period === '1d'
                    ? 1
                    : period === '7d'
                    ? 7
                    : period === '30d'
                    ? 30
                    : 7;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const result = await pool.query(
                `
      SELECT 
        country,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM page_views 
      WHERE website_id = $1 AND timestamp >= $2 AND country IS NOT NULL
      GROUP BY country
      ORDER BY views DESC
      LIMIT 20
    `,
                [websiteId, startDate]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching geography analytics:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// Events
app.get(
    '/api/analytics/:websiteId/events',
    authenticateToken,
    async (req, res) => {
        try {
            const { websiteId } = req.params;
            const { period = '7d' } = req.query;

            const days =
                period === '1d'
                    ? 1
                    : period === '7d'
                    ? 7
                    : period === '30d'
                    ? 30
                    : 7;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const result = await pool.query(
                `
      SELECT 
        event_name,
        COUNT(*) as count,
        event_data
      FROM events 
      WHERE website_id = $1 AND timestamp >= $2
      GROUP BY event_name, event_data
      ORDER BY count DESC
      LIMIT 50
    `,
                [websiteId, startDate]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching events analytics:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// Performance metrics endpoint
app.get(
    '/api/analytics/:websiteId/performance',
    authenticateToken,
    async (req, res) => {
        try {
            const { websiteId } = req.params;
            const { period = '7d' } = req.query;

            const days =
                period === '1d'
                    ? 1
                    : period === '7d'
                    ? 7
                    : period === '30d'
                    ? 30
                    : 7;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const result = await pool.query(
                `
      SELECT 
        AVG(load_time) as avg_load_time,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY load_time) as median_load_time,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY load_time) as p95_load_time,
        AVG(dom_content_loaded) as avg_dom_content_loaded,
        AVG(first_contentful_paint) as avg_first_contentful_paint,
        COUNT(*) as total_pageviews
      FROM page_views 
      WHERE website_id = $1 AND timestamp >= $2 AND load_time IS NOT NULL
    `,
                [websiteId, startDate]
            );

            // Get performance over time
            const dailyPerf = await pool.query(
                `
      SELECT 
        DATE(timestamp) as date,
        AVG(load_time) as avg_load_time,
        AVG(first_contentful_paint) as avg_fcp
      FROM page_views 
      WHERE website_id = $1 AND timestamp >= $2 AND load_time IS NOT NULL
      GROUP BY DATE(timestamp)
      ORDER BY date
    `,
                [websiteId, startDate]
            );

            res.json({
                summary: result.rows[0],
                daily: dailyPerf.rows,
            });
        } catch (error) {
            console.error('Error fetching performance analytics:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// Insights endpoint - provides actionable suggestions
app.get(
    '/api/analytics/:websiteId/insights',
    authenticateToken,
    async (req, res) => {
        try {
            const { websiteId } = req.params;
            const { period = '7d' } = req.query;

            const days =
                period === '1d'
                    ? 1
                    : period === '7d'
                    ? 7
                    : period === '30d'
                    ? 30
                    : 7;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const insights = [];

            // Check page load performance
            const perfResult = await pool.query(
                `SELECT AVG(load_time) as avg_load_time FROM page_views 
                 WHERE website_id = $1 AND timestamp >= $2 AND load_time IS NOT NULL`,
                [websiteId, startDate]
            );
            
            const avgLoadTime = perfResult.rows[0]?.avg_load_time;
            if (avgLoadTime > 3000) {
                insights.push({
                    type: 'warning',
                    category: 'performance',
                    title: 'Slow Page Load Times',
                    message: `Average page load time is ${Math.round(avgLoadTime / 1000)}s. Consider optimizing images, minifying assets, or using a CDN.`,
                    metric: Math.round(avgLoadTime),
                });
            } else if (avgLoadTime < 1500) {
                insights.push({
                    type: 'success',
                    category: 'performance',
                    title: 'Excellent Page Performance',
                    message: `Your pages load in ${Math.round(avgLoadTime / 1000)}s on average. Keep up the good work!`,
                    metric: Math.round(avgLoadTime),
                });
            }

            // Check bounce rate (single page sessions)
            const bounceResult = await pool.query(
                `
                SELECT 
                    COUNT(DISTINCT session_id) as total_sessions,
                    COUNT(DISTINCT CASE WHEN page_count = 1 THEN session_id END) as single_page_sessions
                FROM (
                    SELECT session_id, COUNT(*) as page_count
                    FROM page_views
                    WHERE website_id = $1 AND timestamp >= $2
                    GROUP BY session_id
                ) as session_pages
                `,
                [websiteId, startDate]
            );

            const totalSessions = parseInt(bounceResult.rows[0]?.total_sessions || 0);
            const singlePageSessions = parseInt(bounceResult.rows[0]?.single_page_sessions || 0);
            const bounceRate = totalSessions > 0 ? (singlePageSessions / totalSessions) * 100 : 0;

            if (bounceRate > 70) {
                insights.push({
                    type: 'warning',
                    category: 'engagement',
                    title: 'High Bounce Rate',
                    message: `${Math.round(bounceRate)}% of visitors leave after viewing just one page. Improve content relevance and internal linking.`,
                    metric: Math.round(bounceRate),
                });
            } else if (bounceRate < 40) {
                insights.push({
                    type: 'success',
                    category: 'engagement',
                    title: 'Great User Engagement',
                    message: `Only ${Math.round(bounceRate)}% bounce rate. Your visitors are exploring multiple pages!`,
                    metric: Math.round(bounceRate),
                });
            }

            // Check mobile vs desktop usage
            const deviceResult = await pool.query(
                `
                SELECT device_type, COUNT(*) as count
                FROM page_views
                WHERE website_id = $1 AND timestamp >= $2
                GROUP BY device_type
                `,
                [websiteId, startDate]
            );

            const totalViews = deviceResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
            const mobileViews = deviceResult.rows.find(r => r.device_type === 'mobile')?.count || 0;
            const mobilePercentage = totalViews > 0 ? (mobileViews / totalViews) * 100 : 0;

            if (mobilePercentage > 60) {
                insights.push({
                    type: 'info',
                    category: 'audience',
                    title: 'Mobile-First Audience',
                    message: `${Math.round(mobilePercentage)}% of your traffic is mobile. Ensure your site is fully responsive and mobile-optimized.`,
                    metric: Math.round(mobilePercentage),
                });
            }

            // Check for trending pages
            const trendingResult = await pool.query(
                `
                WITH recent_views AS (
                    SELECT path, COUNT(*) as recent_count
                    FROM page_views
                    WHERE website_id = $1 AND timestamp >= NOW() - INTERVAL '2 days'
                    GROUP BY path
                ),
                older_views AS (
                    SELECT path, COUNT(*) as older_count
                    FROM page_views
                    WHERE website_id = $1 
                      AND timestamp < NOW() - INTERVAL '2 days'
                      AND timestamp >= $2
                    GROUP BY path
                )
                SELECT 
                    r.path,
                    r.recent_count,
                    COALESCE(o.older_count, 0) as older_count,
                    CASE 
                        WHEN COALESCE(o.older_count, 0) > 0 
                        THEN ((r.recent_count::float - o.older_count) / o.older_count) * 100
                        ELSE 100
                    END as growth_rate
                FROM recent_views r
                LEFT JOIN older_views o ON r.path = o.path
                WHERE r.recent_count >= 10
                ORDER BY growth_rate DESC
                LIMIT 1
                `,
                [websiteId, startDate]
            );

            if (trendingResult.rows.length > 0 && trendingResult.rows[0].growth_rate > 50) {
                insights.push({
                    type: 'success',
                    category: 'trending',
                    title: 'Trending Content Detected',
                    message: `${trendingResult.rows[0].path} is gaining ${Math.round(trendingResult.rows[0].growth_rate)}% more views. Consider promoting similar content!`,
                    metric: Math.round(trendingResult.rows[0].growth_rate),
                    path: trendingResult.rows[0].path,
                });
            }

            res.json(insights);
        } catch (error) {
            console.error('Error generating insights:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// Error handling
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
    const pathname = request.url.split('?')[0];
    
    if (pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const websiteId = url.searchParams.get('websiteId');
    
    console.log('WebSocket connection established for website:', websiteId);
    
    if (websiteId) {
        if (!clients.has(websiteId)) {
            clients.set(websiteId, new Set());
        }
        clients.get(websiteId).add(ws);
        
        ws.on('close', () => {
            console.log('WebSocket connection closed for website:', websiteId);
            clients.get(websiteId).delete(ws);
            if (clients.get(websiteId).size === 0) {
                clients.delete(websiteId);
            }
        });
        
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
        
        // Send confirmation message
        ws.send(JSON.stringify({ type: 'connected', websiteId }));
    } else {
        ws.close(1008, 'Website ID required');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    pool.end();
    server.close();
    process.exit(0);
});