process.env.JWT_SECRET = 'admin-revocation-test-secret';

jest.mock('../config/db', () => ({
  isFallback: jest.fn(() => false),
  query: jest.fn(),
}));

const db = require('../config/db');
const { adminMiddleware } = require('../middleware/authMiddleware');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('Admin role revocation middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.isFallback.mockReturnValue(false);
  });

  test('rejects non-admin role in token without querying DB', async () => {
    const req = { user: { id: 1, role: 'customer' } };
    const res = mockResponse();
    const next = jest.fn();

    await adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(db.query).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('allows admin when DB verifies active admin role', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, role: 'admin' }]]);
    const req = { user: { id: 1, role: 'admin' } };
    const res = mockResponse();
    const next = jest.fn();

    await adminMiddleware(req, res, next);

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT role FROM users'), [1]);
    expect(next).toHaveBeenCalled();
  });

  test('rejects with 403 when DB indicates user has been demoted to customer', async () => {
    db.query.mockResolvedValueOnce([[{ id: 2, role: 'customer' }]]);
    const req = { user: { id: 2, role: 'admin' } }; // Token still says admin!
    const res = mockResponse();
    const next = jest.fn();

    await adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/revoked/i) }));
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects with 403 when user no longer exists in DB', async () => {
    db.query.mockResolvedValueOnce([[]]);
    const req = { user: { id: 99, role: 'admin' } };
    const res = mockResponse();
    const next = jest.fn();

    await adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('bypasses DB query when in fallback mock mode', async () => {
    db.isFallback.mockReturnValue(true);
    const req = { user: { id: 1, role: 'admin' } };
    const res = mockResponse();
    const next = jest.fn();

    await adminMiddleware(req, res, next);

    expect(db.query).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
