const jwt = require('jsonwebtoken');
const db = require('../config/db');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user payload to request
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const adminMiddleware = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied, admin only' });
  }

  // In fallback mock mode (or test environment without live DB), trust token claim
  if (db.isFallback && db.isFallback()) {
    return next();
  }

  // Live database check to prevent using tokens from demoted/revoked admins
  try {
    const [rows] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (!rows || rows.length === 0 || rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Access denied, admin privileges revoked' });
    }
    next();
  } catch (err) {
    console.error('Failed to verify admin role against database:', err);
    if (db.isFallback && db.isFallback()) {
      return next();
    }
    return res.status(500).json({ error: 'Database verification failed' });
  }
};

module.exports = { authMiddleware, adminMiddleware };
