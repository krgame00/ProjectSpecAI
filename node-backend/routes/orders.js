const express = require('express');
const router = express.Router();
const db = require('../config/db');
const fs = require('fs').promises;
const path = require('path');

const ordersFilePath = path.join(__dirname, '../orders.json');

// Helper to parse frontend ID back to DB Product ID
function mapFrontendIdToDbId(frontendId) {
  if (typeof frontendId === 'number') return frontendId;
  const strId = String(frontendId);
  if (!isNaN(strId) && !isNaN(parseInt(strId, 10))) return parseInt(strId, 10);
  
  const num = parseInt(strId.replace(/\D/g, ''), 10);
  if (strId.startsWith('c')) return num;
  if (strId.startsWith('m')) return num + 10;
  if (strId.startsWith('r')) return num + 20;
  if (strId.startsWith('g')) return num + 30;
  if (strId.startsWith('s')) return num + 40;
  if (strId.startsWith('p')) return num + 50;
  if (strId.startsWith('case')) return num + 60;
  return num;
}

// GET /api/orders
// ดึงรายการสั่งซื้อทั้งหมด (สำหรับ Admin)
router.get('/', async (req, res, next) => {
  try {
    if (db.isFallback()) {
      let orders = [];
      try {
        const fileData = await fs.readFile(ordersFilePath, 'utf8');
        orders = JSON.parse(fileData);
      } catch (err) {}
      return res.json(orders);
    } else {
      const [ordersRows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
      const [itemsRows] = await db.query('SELECT * FROM order_items');
      
      const orders = ordersRows.map(o => {
        const items = itemsRows.filter(i => i.order_id === o.id);
        const build_items = {};
        items.forEach(item => {
          build_items[item.category_slug] = item.product_id;
        });
        return {
          id: o.id,
          customer_name: o.customer_name,
          customer_address: o.customer_address,
          customer_phone: o.customer_phone,
          assembly_type: o.assembly_type,
          total_price: parseFloat(o.total_price),
          status: o.status,
          created_at: o.created_at,
          build_items: build_items
        };
      });
      return res.json(orders);
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/orders
// สร้างคำสั่งซื้อใหม่ (Checkout)
router.post('/', async (req, res, next) => {
  try {
    let { customer_name, customer_address, customer_phone, assembly_type, total_price, build_items } = req.body;

    // 1. ตรวจสอบข้อมูล (Backend Validation)
    if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length === 0) {
      return res.status(400).json({ error: 'กรุณาระบุชื่อ-นามสกุลให้ถูกต้อง' });
    }
    customer_name = customer_name.trim();
    customer_address = customer_address ? customer_address.trim() : '';

    const phoneRegex = /^[0-9]{10}$/;
    if (!customer_phone || !phoneRegex.test(customer_phone)) {
      return res.status(400).json({ error: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น' });
    }

    const validAssemblyTypes = ['none', 'standard', 'premium'];
    if (!validAssemblyTypes.includes(assembly_type)) {
      return res.status(400).json({ error: 'รูปแบบการประกอบเครื่องไม่ถูกต้อง' });
    }

    if (isNaN(total_price) || parseFloat(total_price) < 0) {
      return res.status(400).json({ error: 'ราคาสุทธิไม่ถูกต้อง' });
    }

    if (!build_items || typeof build_items !== 'object' || Object.keys(build_items).length === 0) {
      return res.status(400).json({ error: 'ไม่มีรายการสินค้าในตะกร้า' });
    }

    const newOrderId = `ORD-${Math.floor(Math.random() * 9000) + 1000}`;

    if (db.isFallback()) {
      // --- Fallback Mode: บันทึกลงไฟล์ orders.json ---
      let orders = [];
      try {
        const fileData = await fs.readFile(ordersFilePath, 'utf8');
        orders = JSON.parse(fileData);
      } catch (err) {
        // File doesn't exist or is empty
      }

      const newOrderObj = {
        id: newOrderId,
        customer_name,
        customer_address,
        customer_phone,
        assembly_type,
        total_price: parseFloat(total_price),
        status: 'assembling',
        created_at: new Date().toISOString(),
        build_items
      };

      orders.unshift(newOrderObj);
      await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
      console.log(`[Fallback DB] Saved order ${newOrderId} to orders.json`);
      
    } else {
      // --- Standard Mode: บันทึกลงตาราง MySQL ---
      // บันทึกลงตาราง orders
      await db.query(`
        INSERT INTO orders (id, customer_name, customer_address, customer_phone, assembly_type, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?, 'assembling')
      `, [newOrderId, customer_name, customer_address, customer_phone, assembly_type, total_price]);

      // วนลูปบันทึกใน order_items
      for (const [category, itemId] of Object.entries(build_items)) {
        if (!itemId) continue;
        const dbProductId = mapFrontendIdToDbId(itemId);
        
        // ค้นหาราคาของสินค้านั้นจากฐานข้อมูลเพื่อบันทึกราคา ณ วันที่ซื้อ
        const [products] = await db.query('SELECT price FROM products WHERE id = ?', [dbProductId]);
        const price = products.length > 0 ? parseFloat(products[0].price) : 0;

        await db.query(`
          INSERT INTO order_items (order_id, product_id, category_slug, price)
          VALUES (?, ?, ?, ?)
        `, [newOrderId, dbProductId, category, price]);
      }
      console.log(`[MySQL DB] Saved order ${newOrderId} and its items to database`);
    }

    res.status(201).json({ 
      success: true, 
      order_id: newOrderId,
      message: 'สร้างคำสั่งซื้อสำเร็จ'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id/status
// ตรวจสอบสถานะคำสั่งซื้อ (ใช้โดย Chatbot หรือหน้า Dashboard)
router.get('/:id/status', async (req, res, next) => {
  try {
    const orderId = req.params.id;

    if (db.isFallback()) {
      // --- Fallback Mode: ค้นหาจากไฟล์ orders.json ---
      try {
        const fileData = await fs.readFile(ordersFilePath, 'utf8');
        const orders = JSON.parse(fileData);
        const order = orders.find(o => o.id === orderId);
        if (order) {
          return res.json({ order_id: orderId, status: order.status });
        }
      } catch (err) {
        // file doesn't exist
      }

      // Default mock orders check
      if (orderId === 'ORD-1001') return res.json({ order_id: orderId, status: 'assembling' });
      if (orderId === 'ORD-1002') return res.json({ order_id: orderId, status: 'shipped' });

      return res.status(404).json({ error: 'Order not found' });
      
    } else {
      // --- Standard Mode: ค้นหาจากฐานข้อมูล ---
      const [rows] = await db.query('SELECT status FROM orders WHERE id = ?', [orderId]);
      if (rows && rows.length > 0) {
        return res.json({ order_id: orderId, status: rows[0].status });
      }

      // Default mock orders check if not found in db yet
      if (orderId === 'ORD-1001') return res.json({ order_id: orderId, status: 'assembling' });
      if (orderId === 'ORD-1002') return res.json({ order_id: orderId, status: 'shipped' });

      return res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    if (db.isFallback()) {
      let orders = [];
      try {
        const fileData = await fs.readFile(ordersFilePath, 'utf8');
        orders = JSON.parse(fileData);
      } catch (err) {}
      
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        orders[idx].status = status;
        await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
      }
    } else {
      await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    }
    
    res.json({ success: true, status });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
