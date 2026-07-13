const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function importArticles() {
  const tidb = await mysql.createPool({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '2zvWBJeXCf3SPRp.root',
    password: 'NyMNiTa4VWaKbEtL',
    database: 'smart_pc_builder',
    ssl: { rejectUnauthorized: true },
    charset: 'utf8mb4'
  });

  try {
    console.log("Reading articles.json...");
    const articlesFilePath = path.join(__dirname, 'articles.json');
    const fileData = await fs.readFile(articlesFilePath, 'utf8');
    const articles = JSON.parse(fileData);
    
    console.log(`Found ${articles.length} articles. Truncating TiDB articles table...`);
    await tidb.query('TRUNCATE TABLE articles');
    
    console.log("Inserting articles into TiDB...");
    for (const article of articles) {
      await tidb.query(
        'INSERT INTO articles (title, content, image_url, created_at) VALUES (?, ?, ?, ?)',
        [article.title, article.content, article.image, article.date]
      );
    }
    
    console.log('Successfully imported articles to TiDB with correct UTF-8 encoding!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await tidb.end();
  }
}

importArticles();
