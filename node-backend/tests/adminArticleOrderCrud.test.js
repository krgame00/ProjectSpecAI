jest.mock('../config/db', () => ({
  isFallback: jest.fn(() => false), query: jest.fn()
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
