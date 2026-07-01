const db = require('../config/db');

const userModel = {
  findByEmail: async (email) => {
    if (db.isFallback && db.isFallback()) {
      return null; // Mock DB doesn't support auth easily, return null
    }
    const pool = db.pool;
    if (!pool) return null;
    
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0]; // Returns user object or undefined
  },

  findById: async (id) => {
    if (db.isFallback && db.isFallback()) return null;
    const pool = db.pool;
    if (!pool) return null;

    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  createUser: async (name, email, hashedPassword, role = 'customer') => {
    if (db.isFallback && db.isFallback()) return null;
    const pool = db.pool;
    if (!pool) return null;

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    return result.insertId;
  },

  getAllUsers: async () => {
    if (db.isFallback && db.isFallback()) return [];
    const pool = db.pool;
    if (!pool) return [];

    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    return rows;
  },

  updateUserRole: async (id, role) => {
    if (db.isFallback && db.isFallback()) return false;
    const pool = db.pool;
    if (!pool) return false;

    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return result.affectedRows > 0;
  },

  deleteUser: async (id) => {
    if (db.isFallback && db.isFallback()) return false;
    const pool = db.pool;
    if (!pool) return false;

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = userModel;
