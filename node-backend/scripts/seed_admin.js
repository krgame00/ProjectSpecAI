require('dotenv').config();
const bcrypt = require('bcryptjs');
const userModel = require('./models/userModel');
const db = require('./config/db');

async function seedAdmin() {
  console.log('Checking for admin account...');
  
  // Wait a moment for pool to initialize
  await new Promise(r => setTimeout(r, 1000));
  
  if (db.isFallback && db.isFallback()) {
    console.log('Running in mock DB mode. Skipping admin seed.');
    process.exit(0);
  }

  const email = 'admin@pc.com';
  const name = 'Admin Ploy';
  const password = 'admin'; // simple password for testing

  try {
    const existingAdmin = await userModel.findByEmail(email);
    if (existingAdmin) {
      console.log('Admin account already exists.');
    } else {
      console.log('Admin account not found. Creating one...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await userModel.createUser(name, email, hashedPassword, 'admin');
      console.log('Admin account created successfully!');
      console.log(`Email: ${email} | Password: ${password}`);
    }
  } catch (error) {
    console.error('Failed to seed admin:', error);
  }
  
  process.exit(0);
}

seedAdmin();
