const db = require('../config/db');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

let inMemoryIdCounter = 100;
let inMemoryUsers = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@pcspec.dev',
    password: null,
    role: 'admin',
    created_at: new Date().toISOString()
  }
];

const ensureAdminSeed = async () => {
  if (inMemoryUsers[0].password) return;
  const salt = await bcrypt.genSalt(10);
  inMemoryUsers[0].password = await bcrypt.hash('admin123', salt);
  logger.info('In-memory admin seeded: admin@pcspec.dev / admin123');
};

const userModel = {
  findByEmail: async (email) => {
    if (db.isFallback && db.isFallback()) {
      await ensureAdminSeed();
      const user = inMemoryUsers.find(u => u.email === email);
      return user || null;
    }
    const pool = db.pool;
    if (!pool) return null;
    
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  findById: async (id) => {
    if (db.isFallback && db.isFallback()) {
      await ensureAdminSeed();
      const user = inMemoryUsers.find(u => u.id === id);
      if (!user) return null;
      const { password, ...safe } = user;
      return safe;
    }
    const pool = db.pool;
    if (!pool) return null;

    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  createUser: async (name, email, hashedPassword, role = 'customer') => {
    if (db.isFallback && db.isFallback()) {
      await ensureAdminSeed();
      const newUser = {
        id: ++inMemoryIdCounter,
        name,
        email,
        password: hashedPassword,
        role,
        created_at: new Date().toISOString()
      };
      inMemoryUsers.push(newUser);
      return newUser.id;
    }
    const pool = db.pool;
    if (!pool) return null;

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    return result.insertId;
  },

  getAllUsers: async (limit = 20, offset = 0) => {
    if (db.isFallback && db.isFallback()) {
      await ensureAdminSeed();
      return inMemoryUsers
        .slice(offset, offset + limit)
        .map(({ password, ...u }) => u);
    }
    const pool = db.pool;
    if (!pool) return [];

    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    return rows;
  },

  getUserCount: async () => {
    if (db.isFallback && db.isFallback()) {
      await ensureAdminSeed();
      return inMemoryUsers.length;
    }
    const pool = db.pool;
    if (!pool) return 0;

    const [rows] = await pool.query('SELECT COUNT(*) as total FROM users');
    return rows[0].total;
  },

  updateUserRole: async (id, role) => {
    if (db.isFallback && db.isFallback()) {
      await ensureAdminSeed();
      const user = inMemoryUsers.find(u => u.id === parseInt(id));
      if (!user) return false;
      user.role = role;
      return true;
    }
    const pool = db.pool;
    if (!pool) return false;

    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return result.affectedRows > 0;
  },

  deleteUser: async (id) => {
    if (db.isFallback && db.isFallback()) {
      await ensureAdminSeed();
      const idx = inMemoryUsers.findIndex(u => u.id === parseInt(id));
      if (idx === -1) return false;
      inMemoryUsers.splice(idx, 1);
      return true;
    }
    const pool = db.pool;
    if (!pool) return false;

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = userModel;
