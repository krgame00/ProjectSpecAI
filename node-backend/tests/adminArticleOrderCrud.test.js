jest.mock('../config/db', () => ({
  isFallback: jest.fn(() => false),
  query: jest.fn(),
  pool: {
    getConnection: jest.fn()
  }
}));

const db = require('../config/db');
const articleController = require('../controllers/articleController');
const ordersController = require('../controllers/ordersController');

const response = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('Admin article mutations', () => {
  beforeEach(() => jest.clearAllMocks());

  test('normalizes database article image and date fields', async () => {
    db.query.mockResolvedValueOnce([[{
      id: 7, title: 'Build', content: 'Text', image_url: '/cover.png', created_at: new Date('2026-08-20T08:00:00Z')
    }]]);
    const res = response();
    await articleController.getAll({}, res, jest.fn());
    expect(res.json).toHaveBeenCalledWith([expect.objectContaining({
      id: 7, image: '/cover.png', date: '2026-08-20'
    })]);
  });

  test('returns the real inserted article id and canonical fields', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 44, affectedRows: 1 }]);
    const res = response();
    await articleController.create({ body: {
      title: 'Build', content: 'Text', image: '/cover.png', date: '2026-08-21'
    } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      article: { id: 44, title: 'Build', content: 'Text', image: '/cover.png', date: '2026-08-21' }
    }));
  });

  test.each(['update', 'delete'])('returns 404 when article %s affects no rows', async action => {
    db.query.mockResolvedValueOnce(action === 'update' ? [[]] : [{ affectedRows: 0 }]);
    const res = response();
    const req = { params: { id: '404' }, body: { title: 'Missing', content: '', image: '', date: '2026-08-21' } };
    await articleController[action](req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('Admin order status mutation', () => {
  beforeEach(() => jest.clearAllMocks());

  test('rejects a status outside the Admin UI values', async () => {
    const res = response();
    await ordersController.updateStatus({ params: { id: 'ORD-1' }, body: { status: 'cancelled' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('returns 404 when the order does not exist', async () => {
    db.query.mockResolvedValueOnce([[]]);
    const res = response();
    await ordersController.updateStatus({ params: { id: 'ORD-404' }, body: { status: 'shipped' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('Order creation and security (C1)', () => {
  let connection;
  beforeEach(() => {
    jest.clearAllMocks();
    connection = {
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
      query: jest.fn()
    };
    db.pool = { getConnection: jest.fn().mockResolvedValue(connection) };
    db.isFallback.mockReturnValue(false);
  });

  test('rejects order with empty items in cart', async () => {
    const res = response();
    await ordersController.create({ body: { build_items: {} } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'No items in cart' });
  });

  test('calculates total from DB prices and ignores client total_price', async () => {
    connection.query
      .mockResolvedValueOnce([[{ id: 1000, price: 4500 }]]) // SELECT product 1000
      .mockResolvedValueOnce([[{ id: 1001, price: 3200 }]]) // SELECT product 1001
      .mockResolvedValueOnce([{ affectedRows: 1 }])          // INSERT orders
      .mockResolvedValueOnce([{ affectedRows: 1 }])          // INSERT order_items 1
      .mockResolvedValueOnce([{ affectedRows: 1 }]);         // INSERT order_items 2

    const req = {
      body: {
        customer_name: 'Tester',
        assembly_type: 'standard', // 500
        total_price: 50, // Client attempt to hack price
        build_items: { cpu: 1000, mobo: 1001 }
      }
    };
    const res = response();
    await ordersController.create(req, res, jest.fn());

    expect(connection.beginTransaction).toHaveBeenCalled();
    expect(connection.commit).toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    // Calculated: 4500 + 3200 + 500 = 8200 (NOT 50)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      total_price: 8200
    }));
  });

  test('rolls back transaction and releases connection when a product does not exist', async () => {
    connection.query.mockResolvedValueOnce([[]]); // product not found

    const req = {
      body: {
        build_items: { cpu: 9999 }
      }
    };
    const res = response();
    await ordersController.create(req, res, jest.fn());

    expect(connection.rollback).toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Product not found for item ID: 9999' });
  });
});

