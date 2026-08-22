const fs = require('fs').promises;
const path = require('path');
const db = require('../config/db');

const articlesFilePath = path.join(__dirname, '../articles.json');
const isoDate = value => {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};
const canonical = row => ({
  id: row.id, title: row.title, content: row.content || '',
  image: row.image ?? row.image_url ?? '', date: isoDate(row.date ?? row.created_at)
});
const loadFallback = async () => {
  try { return JSON.parse(await fs.readFile(articlesFilePath, 'utf8')); }
  catch { return []; }
};

const articleController = {
  getAll: async (req, res, next) => {
    try {
      if (db.isFallback()) return res.json((await loadFallback()).map(canonical));
      const [rows] = await db.query('SELECT id, title, content, image_url, created_at FROM articles ORDER BY created_at DESC');
      return res.json(rows.map(canonical));
    } catch (error) { next(error); }
  },
  create: async (req, res, next) => {
    try {
      const { title, content = '', image = '', date = new Date().toISOString().slice(0, 10) } = req.body;
      if (!title || !String(title).trim()) return res.status(400).json({ error: 'Article title is required' });
      if (db.isFallback()) {
        const rows = await loadFallback();
        const nextId = rows.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
        const article = canonical({ id: nextId, title: String(title).trim(), content, image, date });
        rows.unshift(article);
        await fs.writeFile(articlesFilePath, JSON.stringify(rows, null, 2), 'utf8');
        return res.status(201).json({ success: true, article });
      }
      const [result] = await db.query(
        'INSERT INTO articles (title, content, image_url, created_at) VALUES (?, ?, ?, ?)',
        [String(title).trim(), content, image, date]
      );
      return res.status(201).json({ success: true, article: canonical({ id: result.insertId, title: String(title).trim(), content, image, date }) });
    } catch (error) { next(error); }
  },
  update: async (req, res, next) => {
    try {
      const { title, content = '', image = '', date } = req.body;
      if (!title || !String(title).trim()) return res.status(400).json({ error: 'Article title is required' });
      const id = req.params.id;
      if (db.isFallback()) {
        const rows = await loadFallback();
        const index = rows.findIndex(item => String(item.id) === String(id));
        if (index === -1) return res.status(404).json({ error: 'Article not found' });
        const article = canonical({ id: rows[index].id, title: String(title).trim(), content, image, date });
        rows[index] = article;
        await fs.writeFile(articlesFilePath, JSON.stringify(rows, null, 2), 'utf8');
        return res.json({ success: true, article });
      }
      const [existing] = await db.query('SELECT id FROM articles WHERE id=?', [id]);
      if (!existing.length) return res.status(404).json({ error: 'Article not found' });
      await db.query(
        'UPDATE articles SET title=?, content=?, image_url=?, created_at=? WHERE id=?',
        [String(title).trim(), content, image, date, id]
      );
      return res.json({ success: true, article: canonical({ id: Number(id) || id, title: String(title).trim(), content, image, date }) });
    } catch (error) { next(error); }
  },
  delete: async (req, res, next) => {
    try {
      const id = req.params.id;
      if (db.isFallback()) {
        const rows = await loadFallback();
        const remaining = rows.filter(item => String(item.id) !== String(id));
        if (remaining.length === rows.length) return res.status(404).json({ error: 'Article not found' });
        await fs.writeFile(articlesFilePath, JSON.stringify(remaining, null, 2), 'utf8');
        return res.json({ success: true });
      }
      const [result] = await db.query('DELETE FROM articles WHERE id=?', [id]);
      if (!result.affectedRows) return res.status(404).json({ error: 'Article not found' });
      return res.json({ success: true });
    } catch (error) { next(error); }
  }
};

module.exports = articleController;
