const mysql = require('mysql2/promise');
const mockProducts = require('./mock-data');
const logger = require('../utils/logger');

let pool = null;
let isFallback = false;

// Initialize MySQL pool
const initPool = () => {
  if (pool) return pool;
  
  if (!process.env.DB_HOST) {
    logger.warn("No DB_HOST defined. Falling back to Mock DB mode.");
    isFallback = true;
    return null;
  }

  const dbConfig = process.env.DATABASE_URL 
    ? { uri: process.env.DATABASE_URL, charset: 'utf8mb4' }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smart_pc_builder',
        charset: 'utf8mb4'
      };

  if (process.env.DB_SSL === 'true') {
    dbConfig.ssl = { rejectUnauthorized: true };
  }

  dbConfig.waitForConnections = true;
  dbConfig.connectionLimit = 10;
  dbConfig.queueLimit = 0;

  pool = process.env.DATABASE_URL 
    ? mysql.createPool(process.env.DATABASE_URL, dbConfig)
    : mysql.createPool(dbConfig);

  // Attempt to ping database to check connection on start
  pool.getConnection()
    .then(conn => {
      logger.info('Connected to MySQL database successfully.');
      conn.release();
    })
    .catch(err => {
      logger.error('Failed to connect to MySQL database:', err.message);
      logger.warn('Switching to Mock Database Mode (Fallback). The server will keep running.');
      isFallback = true;
    });

  return pool;
};

initPool();

const db = {
  pool,
  isFallback: () => isFallback,
  query: async (sql, params = []) => {
    if (isFallback) {
      const sqlLower = sql.toLowerCase();
      // Mock Query parsing: if it's querying products/catalog
      if (sqlLower.includes('from products')) {
        return [mockProducts];
      }
      // If it's querying categories
      if (sqlLower.includes('from categories')) {
        return [[
          { id: 1, slug: 'cpu', name_th: 'CPU' },
          { id: 2, slug: 'motherboard', name_th: 'Motherboard' },
          { id: 3, slug: 'ram', name_th: 'RAM' },
          { id: 4, slug: 'gpu', name_th: 'GPU' },
          { id: 5, slug: 'storage', name_th: 'Storage' },
          { id: 6, slug: 'psu', name_th: 'PSU' },
          { id: 7, slug: 'case', name_th: 'Case' }
        ]];
      }
      // Default empty results
      return [[]];
    }

    try {
      const dbPool = initPool();
      if (!dbPool || isFallback) {
        return [mockProducts];
      }
      return await dbPool.query(sql, params);
    } catch (err) {
      logger.error('Database query error:', err);
      throw err;
    }
  }
};

module.exports = db;
