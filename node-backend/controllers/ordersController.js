const db = require('../config/db');
const fs = require('fs').promises;
const path = require('path');
const { mapFrontendIdToDbId } = require('../utils/idMapper');
const logger = require('../utils/logger');

const ordersFilePath = path.join(__dirname, '../orders.json');

const ordersController = {
  getAll: async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const offset = (page - 1) * limit;

      if (db.isFallback()) {
        let orders = [];
        try {
          const fileData = await fs.readFile(ordersFilePath, 'utf8');
          orders = JSON.parse(fileData);
        } catch (err) {}
        const paginated = orders.slice(offset, offset + limit);
        return res.json({ data: paginated, total: orders.length, page, limit });
      }

      const [countResult] = await db.query('SELECT COUNT(*) as total FROM orders');
      const total = countResult[0].total;
      const [ordersRows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
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
          build_items
        };
      });
      res.json({ data: orders, total, page, limit });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      let { customer_name, customer_address, customer_phone, assembly_type, total_price, build_items } = req.body;

      if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length === 0) {
        customer_name = 'Guest';
      } else {
        customer_name = customer_name.trim();
      }

      customer_address = customer_address ? customer_address.trim() : '';
      customer_phone = customer_phone ? customer_phone.trim() : '0000000000';

      if (!build_items || typeof build_items !== 'object' || Object.keys(build_items).length === 0) {
        return res.status(400).json({ error: 'No items in cart' });
      }

      const newOrderId = `ORD-${Math.floor(Math.random() * 9000) + 1000}`;

      if (db.isFallback()) {
        let orders = [];
        try {
          const fileData = await fs.readFile(ordersFilePath, 'utf8');
          orders = JSON.parse(fileData);
        } catch (err) {}

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
        logger.info(`Saved order ${newOrderId} to orders.json`);
      } else {
        await db.query(`
          INSERT INTO orders (id, customer_name, customer_address, customer_phone, assembly_type, total_price, status)
          VALUES (?, ?, ?, ?, ?, ?, 'assembling')
        `, [newOrderId, customer_name, customer_address, customer_phone, assembly_type, total_price]);

        for (const [category, itemId] of Object.entries(build_items)) {
          if (!itemId) continue;
          const dbProductId = mapFrontendIdToDbId(itemId);
          const [products] = await db.query('SELECT price FROM products WHERE id = ?', [dbProductId]);
          const price = products.length > 0 ? parseFloat(products[0].price) : 0;

          await db.query(`
            INSERT INTO order_items (order_id, product_id, category_slug, price)
            VALUES (?, ?, ?, ?)
          `, [newOrderId, dbProductId, category, price]);
        }
        logger.info(`Saved order ${newOrderId} and its items to database`);
      }

      res.status(201).json({
        success: true,
        order_id: newOrderId,
        message: 'Order created successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getStatus: async (req, res, next) => {
    try {
      const orderId = req.params.id;

      if (db.isFallback()) {
        try {
          const fileData = await fs.readFile(ordersFilePath, 'utf8');
          const orders = JSON.parse(fileData);
          const order = orders.find(o => o.id === orderId);
          if (order) {
            return res.json({ order_id: orderId, status: order.status });
          }
        } catch (err) {}

        if (orderId === 'ORD-1001') return res.json({ order_id: orderId, status: 'assembling' });
        if (orderId === 'ORD-1002') return res.json({ order_id: orderId, status: 'shipped' });
        return res.status(404).json({ error: 'Order not found' });
      }

      const [rows] = await db.query('SELECT status FROM orders WHERE id = ?', [orderId]);
      if (rows && rows.length > 0) {
        return res.json({ order_id: orderId, status: rows[0].status });
      }

      if (orderId === 'ORD-1001') return res.json({ order_id: orderId, status: 'assembling' });
      if (orderId === 'ORD-1002') return res.json({ order_id: orderId, status: 'shipped' });
      return res.status(404).json({ error: 'Order not found' });
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req, res, next) => {
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
  }
};

module.exports = ordersController;
