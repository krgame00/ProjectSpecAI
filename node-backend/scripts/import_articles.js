const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function importArticles() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'smart_pc_builder'
    });
    
    console.log('Connected to DB. Creating articles table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // In case the table was already created with VARCHAR(255)
    await connection.execute('ALTER TABLE articles MODIFY image_url TEXT');
    
    console.log('Table created. Reading articles.json...');
    const data = await fs.readFile(path.join(__dirname, 'articles.json'), 'utf8');
    const articles = JSON.parse(data);
    
    for (const article of articles) {
      await connection.execute(
        'INSERT INTO articles (title, content, image_url, created_at) VALUES (?, ?, ?, ?)',
        [article.title, article.content, article.image, article.date ? `${article.date} 00:00:00` : new Date()]
      );
    }
    
    console.log('Successfully imported articles into MySQL!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

importArticles();
