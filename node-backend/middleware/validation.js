function validateRequired(fields) {
  return (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);
    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }
    next();
  };
}

function validateEmail(req, res, next) {
  const { email } = req.body;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  next();
}

function validatePassword(req, res, next) {
  const { password } = req.body;
  if (password && password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  next();
}

function validatePositiveNumber(fields) {
  return (req, res, next) => {
    for (const field of fields) {
      if (req.body[field] !== undefined && (isNaN(req.body[field]) || parseFloat(req.body[field]) < 0)) {
        return res.status(400).json({ error: `${field} must be a positive number` });
      }
    }
    next();
  };
}

function validateEnum(field, allowedValues) {
  return (req, res, next) => {
    if (req.body[field] && !allowedValues.includes(req.body[field])) {
      return res.status(400).json({
        error: `${field} must be one of: ${allowedValues.join(', ')}`
      });
    }
    next();
  };
}

module.exports = {
  validateRequired,
  validateEmail,
  validatePassword,
  validatePositiveNumber,
  validateEnum
};
