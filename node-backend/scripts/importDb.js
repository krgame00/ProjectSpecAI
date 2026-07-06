const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function importDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    await connection.query('CREATE DATABASE IF NOT EXISTS smart_pc_builder');
    await connection.query('USE smart_pc_builder');
    const sql = fs.readFileSync('../database-schema.sql', 'utf8');
    console.log('Executing SQL...');
    await connection.query(sql);
    console.log('Database imported successfully.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    connection.end();
  }
}

importDb();
