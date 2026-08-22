jest.mock('../config/db', () => ({
  isFallback: jest.fn(() => false),
  pool: { getConnection: jest.fn() },
  query: jest.fn()
}));

const db = require('../config/db');
const controller = require('../controllers/hardwareController');

const response = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const cpuBody = {
  category: 'cpu', name: 'AMD Ryzen Test', price: 4990, image: '/cpu.png',
  specifications: { Socket: 'AM4', Cores: '6', Threads: '12', TDP: '65W', Note: 'boxed' }
};

describe('Admin product mutations', () => {
  let connection;
  beforeEach(() => {
    jest.clearAllMocks();
    connection = {
      beginTransaction: jest.fn(), commit: jest.fn(), rollback: jest.fn(), release: jest.fn(),
      query: jest.fn()
        .mockResolvedValueOnce([{ insertId: 321, affectedRows: 1 }])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
    };
    db.pool.getConnection.mockResolvedValue(connection);
  });

  test('creates products and typed specs atomically and returns the real id', async () => {
    const req = { body: cpuBody };
    const res = response();
    const next = jest.fn();

    await controller.create(req, res, next);

    expect(connection.beginTransaction).toHaveBeenCalledTimes(1);
    expect(connection.query.mock.calls[0][0]).toMatch(/INSERT INTO products/);
    expect(connection.query.mock.calls[1][0]).toMatch(/INSERT INTO spec_cpu/);
    expect(connection.query.mock.calls[1][1]).toEqual([321, 'AM4', 6, 12, 65]);
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.rollback).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      product: expect.objectContaining({ id: 321, category: 'cpu', specifications: cpuBody.specifications })
    }));
    expect(next).not.toHaveBeenCalled();
  });

  test.each([
    ['mobo', { Socket: 'AM5', 'Form Factor': 'ATX', 'Memory Type': 'DDR5' }, 'spec_motherboard', [321, 'AM5', 'ATX', 'DDR5']],
    ['ram', { Type: 'DDR5', Capacity: '32GB', Speed: '6000 MT/s' }, 'spec_ram', [321, 'DDR5', 32, 6000]],
    ['gpu', { GPU: 'RTX Test', VRAM: '16GB', Length: '305 mm', TDP: '320W' }, 'spec_gpu', [321, 'RTX Test', 16, 305, 320]],
    ['storage', { Type: 'NVMe', Capacity: '2TB', 'Read Speed': '7000 MB/s', 'Write Speed': '6500 MB/s' }, 'spec_storage', [321, 'NVMe', 2000, 7000, 6500]],
    ['psu', { Wattage: '850W', Efficiency: '80+ Gold' }, 'spec_psu', [321, 850, '80+ Gold']],
    ['case', { 'Form Factor': 'ATX, mATX', 'Max GPU Length': '400 mm' }, 'spec_case', [321, 'ATX, mATX', 400]]
  ])('maps %s form specifications into %s', async (category, specifications, table, values) => {
    const res = response();
    await controller.create({ body: { category, name: `Brand ${category}`, price: 5000, image: '', specifications } }, res, jest.fn());
    expect(connection.query.mock.calls[1][0]).toContain(`INSERT INTO ${table}`);
    expect(connection.query.mock.calls[1][1]).toEqual(values);
    expect(connection.commit).toHaveBeenCalled();
  });

  test('rolls back the product when typed spec persistence fails', async () => {
    connection.query
      .mockReset()
      .mockResolvedValueOnce([{ insertId: 322, affectedRows: 1 }])
      .mockRejectedValueOnce(new Error('spec table unavailable'));
    const next = jest.fn();

    await controller.create({ body: cpuBody }, response(), next);

    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'spec table unavailable' }));
  });

  test('rolls back an existing product update when typed spec persistence fails', async () => {
    connection.query
      .mockReset()
      .mockResolvedValueOnce([[{ id: 321 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockRejectedValueOnce(new Error('typed update failed'));
    const next = jest.fn();
    await controller.update({ params: { id: '321' }, body: cpuBody }, response(), next);
    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.commit).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'typed update failed' }));
  });

  test('returns 404 when updating a product that does not exist', async () => {
    connection.query.mockReset().mockResolvedValueOnce([[]]);
    const res = response();
    await controller.update({ params: { id: '999' }, body: cpuBody }, res, jest.fn());
    expect(connection.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns 409 without deleting a product referenced by order history', async () => {
    db.query.mockResolvedValueOnce([[{ order_id: 'ORD-1' }]]);
    const res = response();
    await controller.delete({ params: { id: '321' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(409);
    expect(db.query).not.toHaveBeenCalledWith(expect.stringMatching(/^DELETE/i), expect.anything());
  });

  test('returns 404 when deleting a product that does not exist', async () => {
    db.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = response();
    await controller.delete({ params: { id: '999' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
