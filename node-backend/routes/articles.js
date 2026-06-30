const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const db = require('../config/db');

const articlesFilePath = path.join(__dirname, '../articles.json');

router.get('/', async (req, res, next) => {
  try {
    if (db.isFallback()) {
      let articles = [];
      try {
        const fileData = await fs.readFile(articlesFilePath, 'utf8');
        articles = JSON.parse(fileData);
      } catch (err) {}
      return res.json(articles);
    }
    const [rows] = await db.query('SELECT * FROM articles ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, content, image, date } = req.body;
    const newId = Math.floor(Math.random() * 10000);
    const newArticle = { id: newId, title, content, image, date: date || new Date().toISOString().split('T')[0] };

    if (db.isFallback()) {
      let articles = [];
      try {
        const fileData = await fs.readFile(articlesFilePath, 'utf8');
        articles = JSON.parse(fileData);
      } catch (err) {}
      articles.unshift(newArticle);
      await fs.writeFile(articlesFilePath, JSON.stringify(articles, null, 2), 'utf8');
    } else {
      await db.query('INSERT INTO articles (title, content, image_url, created_at) VALUES (?, ?, ?, ?)', [title, content, image, newArticle.date]);
    }
    res.json({ success: true, article: newArticle });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { title, content, image, date } = req.body;
    if (db.isFallback()) {
      let articles = [];
      try {
        const fileData = await fs.readFile(articlesFilePath, 'utf8');
        articles = JSON.parse(fileData);
      } catch (err) {}
      const idx = articles.findIndex(a => a.id == id);
      if (idx !== -1) {
        articles[idx] = { ...articles[idx], title, content, image, date };
        await fs.writeFile(articlesFilePath, JSON.stringify(articles, null, 2), 'utf8');
      }
    } else {
      await db.query('UPDATE articles SET title=?, content=?, image_url=?, created_at=? WHERE id=?', [title, content, image, date, id]);
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (db.isFallback()) {
      let articles = [];
      try {
        const fileData = await fs.readFile(articlesFilePath, 'utf8');
        articles = JSON.parse(fileData);
      } catch (err) {}
      const newArticles = articles.filter(a => a.id != id);
      await fs.writeFile(articlesFilePath, JSON.stringify(newArticles, null, 2), 'utf8');
    } else {
      await db.query('DELETE FROM articles WHERE id=?', [id]);
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
