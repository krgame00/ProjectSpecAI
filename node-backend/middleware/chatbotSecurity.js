const MAX_TEXT_LENGTH = 4000;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

function isValidBase64(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length % 4 !== 0) {
    return false;
  }

  return Buffer.from(value, 'base64').toString('base64') === value;
}

function hasMatchingMagicBytes(buffer, mimeType) {
  if (mimeType === 'image/jpeg') {
    return buffer.length >= 3
      && buffer[0] === 0xff
      && buffer[1] === 0xd8
      && buffer[2] === 0xff;
  }

  if (mimeType === 'image/png') {
    return buffer.length >= 8
      && buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      );
  }

  if (mimeType === 'image/webp') {
    return buffer.length >= 12
      && buffer.toString('ascii', 0, 4) === 'RIFF'
      && buffer.toString('ascii', 8, 12) === 'WEBP';
  }

  return true;
}

function validateChatbotPayload(req, res, next) {
  const body = req.body || {};
  const text = body.text !== undefined ? body.text : body.message;

  if (text !== undefined && typeof text !== 'string') {
    return res.status(400).json({ error: 'Chatbot text must be a string' });
  }

  if (typeof text === 'string' && text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: 'Chatbot text exceeds 4,000 characters' });
  }

  if (!body.image && (typeof text !== 'string' || text.trim() === '')) {
    return res.status(400).json({ error: 'Message or image is required' });
  }

  if (body.image && !ALLOWED_IMAGE_MIME_TYPES.has(body.image.mimeType)) {
    return res.status(400).json({ error: 'Unsupported image MIME type' });
  }

  if (body.image && !isValidBase64(body.image.data)) {
    return res.status(400).json({ error: 'Malformed base64 image data' });
  }

  if (body.image) {
    const decodedImage = Buffer.from(body.image.data, 'base64');

    if (decodedImage.length > MAX_IMAGE_BYTES) {
      return res.status(400).json({ error: 'Image exceeds 8 MiB' });
    }

    if (!hasMatchingMagicBytes(decodedImage, body.image.mimeType)) {
      return res.status(400).json({ error: 'Image bytes do not match declared MIME type' });
    }
  }

  next();
}

function createChatbotRateLimiter({ limit, windowMs, now = Date.now }) {
  const buckets = new Map();

  return (req, res, next) => {
    const userId = String(req.user.id);
    const currentTime = now();
    let bucket = buckets.get(userId);

    if (!bucket || currentTime >= bucket.resetAt) {
      bucket = { count: 0, resetAt: currentTime + windowMs };
      buckets.set(userId, bucket);
    }

    res.set('RateLimit-Limit', limit);
    res.set('RateLimit-Remaining', Math.max(limit - bucket.count, 0));
    res.set(
      'RateLimit-Reset',
      Math.max(Math.ceil((bucket.resetAt - currentTime) / 1000), 0)
    );

    if (bucket.count >= limit) {
      return res.status(429).json({ error: 'Chatbot rate limit exceeded' });
    }

    bucket.count += 1;
    res.set('RateLimit-Remaining', limit - bucket.count);
    return next();
  };
}

const chatbotRateLimiter = createChatbotRateLimiter({
  limit: 40,
  windowMs: 900000
});

module.exports = {
  validateChatbotPayload,
  createChatbotRateLimiter,
  chatbotRateLimiter
};
