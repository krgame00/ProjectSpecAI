require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mysql = require('mysql2/promise');

async function syncArticlesToTiDB() {
  console.log('================================================================');
  console.log('☁️ SYNCHRONIZING ARTICLES TABLE TO TIDB CLOUD (PRODUCTION)');
  console.log('================================================================\n');

  const localDb = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const tidb = await mysql.createPool({
    host: process.env.TIDB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: parseInt(process.env.TIDB_PORT || '4000'),
    user: process.env.TIDB_USER || '2zvWBJeXCf3SPRp.root',
    password: process.env.TIDB_PASSWORD || 'NyMNiTa4VWaKbEtL',
    database: process.env.TIDB_NAME || 'smart_pc_builder',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  try {
    console.log('🔌 Connected to local MySQL and TiDB Cloud.');
    
    // Fetch all 15 articles from local MySQL
    const [localArticles] = await localDb.query('SELECT * FROM articles ORDER BY id ASC');
    console.log(`📋 Found ${localArticles.length} articles in local database.`);

    if (localArticles.length === 0) {
      throw new Error('Local database has 0 articles. Aborting sync.');
    }

    // Safely delete existing articles from TiDB
    await tidb.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🗑️ Clearing old articles from TiDB articles table...');
    await tidb.query('TRUNCATE TABLE articles');

    // Insert each article
    console.log('🚀 Inserting articles to TiDB Cloud...');
    for (const art of localArticles) {
      await tidb.query(
        'INSERT INTO articles (id, title, content, image_url, created_at) VALUES (?, ?, ?, ?, ?)',
        [art.id, art.title, art.content, art.image_url, art.created_at]
      );
      console.log(`  + [ID ${art.id}] ${art.title.slice(0, 40)}...`);
    }

    await tidb.query('SET FOREIGN_KEY_CHECKS = 1');

    // Verify
    const [countResult] = await tidb.query('SELECT COUNT(*) as cnt FROM articles');
    console.log(`\n✅ Verified TiDB articles count: ${countResult[0].cnt} articles.`);

    const [sample] = await tidb.query('SELECT id, title, image_url FROM articles ORDER BY id ASC LIMIT 5');
    console.log('\n🔍 Sample articles in TiDB Cloud:');
    console.log(JSON.stringify(sample, null, 2));

    console.log('\n🎉 ARTICLES TABLE SYNCHRONIZATION COMPLETE 100%!');
  } catch (err) {
    console.error('❌ Error syncing articles to TiDB:', err);
    throw err;
  } finally {
    await localDb.end();
    await tidb.end();
  }
}

syncArticlesToTiDB().catch(err => {
  console.error(err);
  process.exit(1);
});
