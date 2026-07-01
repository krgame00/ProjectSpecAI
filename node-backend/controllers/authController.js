const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_pcspec_key_123';

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน (name, email, password)' });
      }

      // Check if email already exists
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'อีเมลนี้มีผู้ใช้งานแล้ว' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const insertId = await userModel.createUser(name, email, hashedPassword);
      if (!insertId) {
        return res.status(500).json({ error: 'Database connection failed.' });
      }

      // Create JWT
      const token = jwt.sign(
        { id: insertId, role: 'customer' },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.status(201).json({
        message: 'สมัครสมาชิกสำเร็จ',
        token,
        user: { id: insertId, name, email, role: 'customer' }
      });
    } catch (error) {
      console.error('Register Error:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
      }

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.status(200).json({
        message: 'เข้าสู่ระบบสำเร็จ',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
    }
  },

  getProfile: async (req, res) => {
    try {
      // req.user comes from authMiddleware
      const user = await userModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await userModel.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error('Get All Users Error:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก' });
    }
  },

  updateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!['customer', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'สิทธิ์การใช้งานไม่ถูกต้อง' });
      }

      // Block admin from changing their own role (preventing accidental self-demotion)
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: 'ไม่อนุญาตให้เปลี่ยนสิทธิ์ของตัวเอง' });
      }

      const success = await userModel.updateUserRole(id, role);
      if (success) {
        res.status(200).json({ message: 'เปลี่ยนสิทธิ์สำเร็จ' });
      } else {
        res.status(404).json({ error: 'ไม่พบผู้ใช้นี้' });
      }
    } catch (error) {
      console.error('Update Role Error:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการปรับเปลี่ยนสิทธิ์' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      // Block admin from deleting themselves
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: 'ไม่อนุญาตให้ลบบัญชีของตัวเองขณะใช้งาน' });
      }

      const success = await userModel.deleteUser(id);
      if (success) {
        res.status(200).json({ message: 'ลบบัญชีผู้ใช้สำเร็จ' });
      } else {
        res.status(404).json({ error: 'ไม่พบผู้ใช้นี้' });
      }
    } catch (error) {
      console.error('Delete User Error:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบบัญชี' });
    }
  }
};

module.exports = authController;
