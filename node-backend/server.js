require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

// Import Database Connection (Triggers connection check and handles fallback mode)
const db = require('./config/db');

// Import Routes
const hardwareRoutes = require('./routes/hardware');
const chatbotRoutes = require('./routes/chatbot');
const ordersRoutes = require('./routes/orders');
const articlesRoutes = require('./routes/articles');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy (Railway, Vercel, etc.) for correct IP in rate limiting
app.set('trust proxy', 1);

// Middleware
let corsOptions = { origin: '*' };
if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*') {
  corsOptions.origin = process.env.CORS_ORIGIN.split(',');
}
app.use(cors(corsOptions));
app.use(express.json());

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

// API Routes
app.use('/api/hardware', hardwareRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/auth', authLimiter, authRoutes); // Apply stricter limit for Auth

// Base Route
app.get('/', (req, res) => {
  res.send('Smart PC Builder API is running.');
});

// Health Check Endpoint (Node.js Pattern: Health check endpoints)
app.get('/api/health', (req, res) => {
  const dbStatus = db.isFallback() ? 'fallback_mock' : 'connected';
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Express Error Middleware (Node.js Pattern: Global Express error handler)
app.use((err, req, res, next) => {
  console.error('Unhandled Route Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

// Global Exception Handler (Node.js Pattern: Global unhandled exception catching)
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
  // Graceful shutdown on fatal uncaught errors
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('WARNING: Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful Shutdown (Node.js Pattern: Clean resource teardown)
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    if (db.pool && !db.isFallback()) {
      try {
        await db.pool.end();
        console.log('Database pool closed.');
      } catch (err) {
        console.error('Error closing database pool:', err);
      }
    }
    process.exit(signal === 'uncaughtException' ? 1 : 0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
