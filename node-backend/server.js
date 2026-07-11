require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const dns = require('dns');
const logger = require('./utils/logger');

// Fix IPv6 fetch issues in Node 18+ (common in Docker/Railway when reaching Google APIs)
dns.setDefaultResultOrder('ipv4first');

// Import Database Connection (Triggers connection check and handles fallback mode)
const db = require('./config/db');

// Import Routes
const hardwareRoutes = require('./routes/hardware');
const chatbotRoutes = require('./routes/chatbot');
const ordersRoutes = require('./routes/orders');
const articlesRoutes = require('./routes/articles');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/upload');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy (Railway, Vercel, etc.) for correct IP in rate limiting
app.set('trust proxy', 1);

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000', 'https://project-spec-ai.vercel.app'];
let corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '20mb' }));

// --- Rate Limiting ---
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: { error: 'คำขอเข้าใช้งานระบบเยอะเกินไป กรุณารอสักครู่ (Too many requests)' },
  standardHeaders: true, 
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 15, // Limit each IP to 15 login/register requests per window
  message: { error: 'คุณพยายามเข้าสู่ระบบ/สมัครสมาชิกบ่อยเกินไป กรุณารอ 15 นาที' }
});

// Apply global limiter to all routes
app.use(globalLimiter);

// API Routes (v1)
app.use('/api/v1/hardware', hardwareRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/articles', articlesRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/auth', authLimiter, authRoutes);

// Backward compatibility redirects from /api/ to /api/v1/
app.use('/api/hardware', (req, res) => res.redirect(301, `/api/v1/hardware${req.url}`));
app.use('/api/chatbot', (req, res) => res.redirect(301, `/api/v1/chatbot${req.url}`));
app.use('/api/orders', (req, res) => res.redirect(301, `/api/v1/orders${req.url}`));
app.use('/api/articles', (req, res) => res.redirect(301, `/api/v1/articles${req.url}`));
app.use('/api/upload', (req, res) => res.redirect(301, `/api/v1/upload${req.url}`));
app.use('/api/auth', (req, res) => res.redirect(301, `/api/v1/auth${req.url}`));

// Serve static files from public/uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Base Route
app.get('/', (req, res) => {
  res.send('Smart PC Builder API is running.');
});

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  const dbStatus = db.isFallback() ? 'fallback_mock' : 'connected';
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Express Error Middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled Route Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server is running on http://0.0.0.0:${PORT}`);
});

// Global Exception Handler
process.on('uncaughtException', (err) => {
  logger.error('CRITICAL: Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.warn('Unhandled Rejection at:', reason);
});

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    if (db.pool && !db.isFallback()) {
      try {
        await db.pool.end();
        logger.info('Database pool closed.');
      } catch (err) {
        logger.error('Error closing database pool:', err);
      }
    }
    process.exit(signal === 'uncaughtException' ? 1 : 0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
