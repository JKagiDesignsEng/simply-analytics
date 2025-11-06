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

        if (!domain || !path) {
            return res
                .status(400)
                .json({ error: 'Domain and path are required' });
        }

        // Get or create website
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

        const websiteId = website.rows[0].id;
        const ip = getClientIP(req);
        const userAgent = req.headers['user-agent'] || '';
        const { browser, os, device_type } = parseUserAgent(userAgent);

        // Get country from IP
        const geo = geoip.lookup(ip);
        const country = geo ? geo.country : null;

        // Track page view
        if (!eventName) {
            await pool.query(
                `
        INSERT INTO page_views (
          website_id, session_id, path, referrer, user_agent, ip_address,
          country, browser, os, device_type, screen_width, screen_height, duration
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `,
                [
                    websiteId,
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
                ]
            );
        } else {
            // Track custom event
            await pool.query(
                `
        INSERT INTO events (website_id, session_id, event_name, event_data, path)
        VALUES ($1, $2, $3, $4, $5)
      `,
                [websiteId, sessionId, eventName, eventData, path]
            );
        }

        if (clients.has(websiteId)) {
            const updateMessage = JSON.stringify({ type: eventName ? 'event' : 'pageview', data: req.body });
            clients.get(websiteId).forEach(client => {
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
    const params = querystring.parse(req.url.split('?')[1] || '');
    const websiteId = params.websiteId;
    
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