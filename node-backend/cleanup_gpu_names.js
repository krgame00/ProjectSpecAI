const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

(async () => {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            port: process.env.DB_PORT || 4000,
            user: process.env.DB_USER || '2zvWBJeXCf3SPRp.root',
            password: process.env.DB_PASSWORD || 'NyMNiTa4VWaKbEtL',
            database: process.env.DB_NAME || 'smart_pc_builder',
            ssl: { rejectUnauthorized: false },
            charset: 'utf8mb4'
        });

        // Fetch all GPUs
        const [rows] = await db.query('SELECT id, brand, model FROM products WHERE category_id = 4');
        let count = 0;
        
        for (let r of rows) {
            let newModel = r.model;
            
            // Remove 'VGA(การ์ดจอ) ' anywhere at the start
            newModel = newModel.replace(/^VGA\s*\(\s*การ์ดจอ\s*\)\s*/i, '');
            
            // Remove brand if it's at the start (e.g. 'GALAX GEFORCE' -> 'GEFORCE')
            const brandRegex = new RegExp('^' + r.brand + '\\s+', 'i');
            newModel = newModel.replace(brandRegex, '').trim();
            
            if (newModel !== r.model) {
                await db.query('UPDATE products SET model = ? WHERE id = ?', [newModel, r.id]);
                count++;
            }
        }
        
        console.log('Updated ' + count + ' products');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
