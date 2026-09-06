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
      
      if (ordersRows.length === 0) {
        return res.json({ data: [], total, page, limit });
      }

      const orderIds = ordersRows.map(o => o.id);
      const [itemsRows] = await db.query('SELECT * FROM order_items WHERE order_id IN (?)', [orderIds]);

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
    let connection;
    try {
      let { customer_name, customer_address, customer_phone, assembly_type, build_items } = req.body;

      if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length === 0) {
        customer_name = 'Guest';
      } else {
        customer_name = customer_name.trim();
      }

      customer_address = customer_address ? String(customer_address).trim() : '';
      customer_phone = customer_phone ? String(customer_phone).trim() : '0000000000';

      if (!build_items || typeof build_items !== 'object' || Object.keys(build_items).length === 0) {
        return res.status(400).json({ error: 'No items in cart' });
      }

      const validItemEntries = Object.entries(build_items).filter(([_, itemId]) => itemId !== null && itemId !== undefined && itemId !== '');
      if (validItemEntries.length === 0) {
        return res.status(400).json({ error: 'No items in cart' });
      }

      const ASSEMBLY_FEES = {
        none: 0,
        standard: 500,
        premium: 1000
      };
      const normalizedAssemblyType = ASSEMBLY_FEES[assembly_type] !== undefined ? assembly_type : 'none';
      const assemblyFee = ASSEMBLY_FEES[normalizedAssemblyType];

      // Collision-resistant order ID (ORD-YYYYMMDD-XXXXXX)
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(100000 + Math.random() * 900000);
      const newOrderId = `ORD-${datePart}-${randomPart}`;

      if (db.isFallback()) {
        const mockProducts = require('../config/mock-data');
        let calculatedItemsTotal = 0;
        const validItems = {};

        for (const [category, itemId] of validItemEntries) {
          const dbProductId = mapFrontendIdToDbId(itemId);
          const found = mockProducts.find(p => p.id === dbProductId || p.id === itemId || String(p.id) === String(itemId));
          const price = found ? (parseFloat(found.price) || 0) : 0;
          calculatedItemsTotal += price;
          validItems[category] = dbProductId;
        }

        const calculatedTotal = calculatedItemsTotal + assemblyFee;

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
          assembly_type: normalizedAssemblyType,
          total_price: calculatedTotal,
          status: 'assembling',
          created_at: new Date().toISOString(),
          build_items: validItems
        };

        orders.unshift(newOrderObj);
        await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
        logger.info(`Saved order ${newOrderId} (total: ${calculatedTotal}) to orders.json`);

        return res.status(201).json({
          success: true,
          order_id: newOrderId,
          total_price: calculatedTotal,
          message: 'Order created successfully'
        });
      }

      connection = await db.pool.getConnection();
      await connection.beginTransaction();

      let calculatedItemsTotal = 0;
      const itemsToInsert = [];

      for (const [category, itemId] of validItemEntries) {
        const dbProductId = mapFrontendIdToDbId(itemId);
        const [products] = await connection.query('SELECT id, price FROM products WHERE id = ? FOR UPDATE', [dbProductId]);
        if (!products || products.length === 0) {
          await connection.rollback();
          return res.status(400).json({ error: `Product not found for item ID: ${itemId}` });
        }
        const price = parseFloat(products[0].price) || 0;
        calculatedItemsTotal += price;
        itemsToInsert.push({
          productId: dbProductId,
          categorySlug: category,
          price
        });
      }

      const calculatedTotal = calculatedItemsTotal + assemblyFee;

      await connection.query(`
        INSERT INTO orders (id, customer_name, customer_address, customer_phone, assembly_type, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?, 'assembling')
      `, [newOrderId, customer_name, customer_address, customer_phone, normalizedAssemblyType, calculatedTotal]);

      for (const item of itemsToInsert) {
        await connection.query(`
          INSERT INTO order_items (order_id, product_id, category_slug, price)
          VALUES (?, ?, ?, ?)
        `, [newOrderId, item.productId, item.categorySlug, item.price]);
      }

      await connection.commit();
      logger.info(`Saved order ${newOrderId} (total: ${calculatedTotal}) and its items to database`);

      return res.status(201).json({
        success: true,
        order_id: newOrderId,
        total_price: calculatedTotal,
        message: 'Order created successfully'
      });
    } catch (error) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rbErr) {
          logger.error('Rollback error:', rbErr);
        }
      }
      next(error);
    } finally {
      if (connection) {
        try {
          connection.release();
        } catch (relErr) {
          logger.error('Connection release error:', relErr);
        }
      }
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

        if (process.env.NODE_ENV !== 'production') {
          if (orderId === 'ORD-1001') return res.json({ order_id: orderId, status: 'assembling' });
          if (orderId === 'ORD-1002') return res.json({ order_id: orderId, status: 'shipped' });
        }
        return res.status(404).json({ error: 'Order not found' });
      }

      const [rows] = await db.query('SELECT status FROM orders WHERE id = ?', [orderId]);
      if (rows && rows.length > 0) {
        return res.json({ order_id: orderId, status: rows[0].status });
      }

      if (process.env.NODE_ENV !== 'production') {
        if (orderId === 'ORD-1001') return res.json({ order_id: orderId, status: 'assembling' });
        if (orderId === 'ORD-1002') return res.json({ order_id: orderId, status: 'shipped' });
      }
      return res.status(404).json({ error: 'Order not found' });
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const orderId = req.params.id;
      const { status } = req.body;
      const allowedStatuses = ['pending', 'assembling', 'shipped'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid order status' });
      }

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
        } else return res.status(404).json({ error: 'Order not found' });
      } else {
        const [existing] = await db.query('SELECT id FROM orders WHERE id = ?', [orderId]);
        if (!existing.length) return res.status(404).json({ error: 'Order not found' });
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
      }

      res.json({ success: true, status });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ordersController;
