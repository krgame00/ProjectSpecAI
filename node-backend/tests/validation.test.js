const { validateRequired, validateEmail, validatePassword, validatePositiveNumber, validateEnum } = require('../middleware/validation');

describe('validation middleware', () => {
  function mockReqRes(body = {}) {
    const req = { body };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    return { req, res, next };
  }

  describe('validateRequired', () => {
    test('calls next if all fields present', () => {
      const { req, res, next } = mockReqRes({ name: 'test', price: 100 });
      validateRequired(['name', 'price'])(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('returns 400 if field missing', () => {
      const { req, res, next } = mockReqRes({ name: 'test' });
      validateRequired(['name', 'price'])(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('price') });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateEmail', () => {
    test('passes valid email', () => {
      const { req, res, next } = mockReqRes({ email: 'test@example.com' });
      validateEmail(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('rejects invalid email', () => {
      const { req, res, next } = mockReqRes({ email: 'not-an-email' });
      validateEmail(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    test('passes if no email in body', () => {
      const { req, res, next } = mockReqRes({});
      validateEmail(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('validatePassword', () => {
    test('passes password >= 6 chars', () => {
      const { req, res, next } = mockReqRes({ password: '123456' });
      validatePassword(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('rejects password < 6 chars', () => {
      const { req, res, next } = mockReqRes({ password: '12345' });
      validatePassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validatePositiveNumber', () => {
    test('passes positive number', () => {
      const { req, res, next } = mockReqRes({ price: 100 });
      validatePositiveNumber(['price'])(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('rejects negative number', () => {
      const { req, res, next } = mockReqRes({ price: -10 });
      validatePositiveNumber(['price'])(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateEnum', () => {
    test('passes valid value', () => {
      const { req, res, next } = mockReqRes({ role: 'admin' });
      validateEnum('role', ['admin', 'customer'])(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('rejects invalid value', () => {
      const { req, res, next } = mockReqRes({ role: 'superadmin' });
      validateEnum('role', ['admin', 'customer'])(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
