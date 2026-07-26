const MAX_TEXT_LENGTH = 4000;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_HISTORY_TURNS = 20;
const MAX_HISTORY_TURN_TEXT_LENGTH = 4000;
const MAX_HISTORY_TEXT_LENGTH = 16000;

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);
const ALLOWED_HISTORY_ROLES = new Set(['user', 'bot', 'model', 'assistant']);

function base64Value(charCode) {
  if (charCode >= 65 && charCode <= 90) return charCode - 65;
  if (charCode >= 97 && charCode <= 122) return charCode - 71;
  if (charCode >= 48 && charCode <= 57) return charCode + 4;
  if (charCode === 43) return 62;
  if (charCode === 47) return 63;
  return -1;
}

function getDecodedBase64Length(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length % 4 !== 0) {
    return null;
  }

  let padding = 0;
  if (value.endsWith('=')) padding += 1;
  if (value.endsWith('==')) padding += 1;
  const dataLength = value.length - padding;

  for (let index = 0; index < dataLength; index += 1) {
    if (base64Value(value.charCodeAt(index)) === -1) {
      return null;
    }
  }

  for (let index = dataLength; index < value.length; index += 1) {
    if (value.charCodeAt(index) !== 61) {
      return null;
    }
  }

  if (padding === 2 && (base64Value(value.charCodeAt(dataLength - 1)) & 15) !== 0) {
    return null;
  }

  if (padding === 1 && (base64Value(value.charCodeAt(dataLength - 1)) & 3) !== 0) {
    return null;
  }

  return (value.length / 4 * 3) - padding;
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
      && buffer[0] === 0x89
      && buffer[1] === 0x50
      && buffer[2] === 0x4e
      && buffer[3] === 0x47
      && buffer[4] === 0x0d
      && buffer[5] === 0x0a
      && buffer[6] === 0x1a
      && buffer[7] === 0x0a;
  }

  if (mimeType === 'image/webp') {
    return buffer.length >= 12
      && buffer.toString('ascii', 0, 4) === 'RIFF'
      && buffer.toString('ascii', 8, 12) === 'WEBP';
  }

  return true;
}

function hasValidHistoryShape(history) {
  if (!Array.isArray(history)) {
    return false;
  }

  return history.every((turn) => {
    if (turn === null || typeof turn !== 'object' || Array.isArray(turn)) {
      return false;
    }

    const prototype = Object.getPrototypeOf(turn);
    return (prototype === Object.prototype || prototype === null)
      && ALLOWED_HISTORY_ROLES.has(turn.role)
      && typeof turn.text === 'string';
  });
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

  if (
    body.history !== undefined
    && (
      !hasValidHistoryShape(body.history)
      || body.history.length > MAX_HISTORY_TURNS
      || body.history.some(
        (turn) => turn.text.length > MAX_HISTORY_TURN_TEXT_LENGTH
      )
      || body.history.reduce((total, turn) => total + turn.text.length, 0)
        > MAX_HISTORY_TEXT_LENGTH
    )
  ) {
    return res.status(400).json({ error: 'Invalid chatbot history' });
  }

  if (body.image && !ALLOWED_IMAGE_MIME_TYPES.has(body.image.mimeType)) {
    return res.status(400).json({ error: 'Unsupported image MIME type' });
  }

  if (body.image) {
    const decodedLength = getDecodedBase64Length(body.image.data);

    if (decodedLength === null) {
      return res.status(400).json({ error: 'Malformed base64 image data' });
    }

    if (decodedLength > MAX_IMAGE_BYTES) {
      return res.status(400).json({ error: 'Image exceeds 8 MiB' });
    }

    const decodedImage = Buffer.from(body.image.data, 'base64');

    if (!hasMatchingMagicBytes(decodedImage, body.image.mimeType)) {
      return res.status(400).json({ error: 'Image bytes do not match declared MIME type' });
    }
  }

  next();
}

function createChatbotRateLimiter({ limit, windowMs, now = Date.now }) {
  const buckets = new Map();
  let nextSweepAt = null;

  return (req, res, next) => {
    const userId = String(req.user.id);
    const currentTime = now();

    if (nextSweepAt === null) {
      nextSweepAt = currentTime + windowMs;
    } else if (currentTime >= nextSweepAt) {
      for (const [bucketUserId, bucket] of buckets) {
        if (currentTime >= bucket.resetAt) {
          buckets.delete(bucketUserId);
        }
      }
      nextSweepAt = currentTime + windowMs;
    }

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
  MAX_TEXT_LENGTH,
  MAX_IMAGE_BYTES,
  MAX_HISTORY_TURNS,
  MAX_HISTORY_TURN_TEXT_LENGTH,
  MAX_HISTORY_TEXT_LENGTH,
  validateChatbotPayload,
  createChatbotRateLimiter,
  chatbotRateLimiter
};
