const {
  validateChatbotPayload,
  createChatbotRateLimiter,
  chatbotRateLimiter
} = require('../middleware/chatbotSecurity');

function responseDouble() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    set(name, value) { this.headers[name] = String(value); return this; }
  };
}

function pngBase64(bytes = 32) {
  const buffer = Buffer.alloc(bytes);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer);
  return buffer.toString('base64');
}

describe('validateChatbotPayload', () => {
  test('rejects text longer than 4,000 characters without calling next', () => {
    const req = { body: { text: 'x'.repeat(4001) } };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts text with exactly 4,000 characters', () => {
    const req = { body: { text: 'x'.repeat(4000) } };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  test('rejects unsupported image MIME types', () => {
    const req = {
      body: { image: { mimeType: 'image/gif', data: pngBase64() } }
    };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects malformed base64 image data', () => {
    const req = {
      body: {
        image: { mimeType: 'image/png', data: 'not-base64%%%' }
      }
    };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects a JPEG declaration containing PNG bytes', () => {
    const req = {
      body: {
        image: { mimeType: 'image/jpeg', data: pngBase64() }
      }
    };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts JPEG image data with a matching signature', () => {
    const jpeg = Buffer.alloc(32);
    Buffer.from([0xff, 0xd8, 0xff]).copy(jpeg);
    const req = {
      body: {
        image: { mimeType: 'image/jpeg', data: jpeg.toString('base64') }
      }
    };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  test('rejects a PNG declaration without the PNG signature', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0x00]).toString('base64');
    const req = {
      body: {
        image: { mimeType: 'image/png', data: jpeg }
      }
    };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts PNG image data with a matching signature', () => {
    const req = {
      body: {
        image: { mimeType: 'image/png', data: pngBase64() }
      }
    };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  test('rejects a decoded PNG larger than 8 MiB', () => {
    const req = {
      body: {
        image: {
          mimeType: 'image/png',
          data: pngBase64((8 * 1024 * 1024) + 1)
        }
      }
    };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts a decoded PNG with exactly 8 MiB', () => {
    const req = {
      body: {
        image: {
          mimeType: 'image/png',
          data: pngBase64(8 * 1024 * 1024)
        }
      }
    };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  test('rejects an oversized encoded image before decoding base64', () => {
    const oversizedBase64 = 'A'.repeat(11184812);
    const req = {
      body: {
        image: { mimeType: 'image/png', data: oversizedBase64 }
      }
    };
    const res = responseDouble();
    const next = jest.fn();
    const bufferFromSpy = jest.spyOn(Buffer, 'from');

    try {
      validateChatbotPayload(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(next).not.toHaveBeenCalled();
      expect(bufferFromSpy).not.toHaveBeenCalled();
    } finally {
      bufferFromSpy.mockRestore();
    }
  });

  test('rejects WebP data without RIFF and WEBP markers', () => {
    const req = {
      body: {
        image: { mimeType: 'image/webp', data: pngBase64() }
      }
    };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts WebP data with RIFF and WEBP markers', () => {
    const webp = Buffer.alloc(32);
    webp.write('RIFF', 0, 'ascii');
    webp.write('WEBP', 8, 'ascii');
    const req = {
      body: {
        image: { mimeType: 'image/webp', data: webp.toString('base64') }
      }
    };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  test('rejects non-string text', () => {
    const req = { body: { text: { prompt: 'hello' } } };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects a blank request without an image', () => {
    const req = {};
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts the message field as the text alias', () => {
    const req = { body: { message: 'Help me choose a GPU' } };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  test.each([
    ['a non-array history', {}],
    ['a non-object turn', ['hello']],
    ['an array turn', [[]]],
    ['an unsupported role', [{ role: 'system', text: 'hello' }]],
    ['non-string turn text', [{ role: 'user', text: 42 }]]
  ])('rejects %s with a stable validation response', (description, history) => {
    const req = { body: { message: 'hello', history } };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid chatbot history' });
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects history with more than 20 turns', () => {
    const history = Array.from(
      { length: 21 },
      (_, index) => ({ role: index % 2 === 0 ? 'user' : 'assistant', text: 'x' })
    );
    const req = { body: { message: 'hello', history } };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid chatbot history' });
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects a history turn with more than 4,000 text characters', () => {
    const history = [{ role: 'user', text: 'x'.repeat(4001) }];
    const req = { body: { message: 'hello', history } };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid chatbot history' });
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects history with more than 16,000 aggregate text characters', () => {
    const history = [
      { role: 'user', text: 'a'.repeat(4000) },
      { role: 'assistant', text: 'b'.repeat(4000) },
      { role: 'user', text: 'c'.repeat(4000) },
      { role: 'bot', text: 'd'.repeat(4000) },
      { role: 'model', text: 'e' }
    ];
    const req = { body: { message: 'hello', history } };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid chatbot history' });
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts 20 valid turns at the per-turn and aggregate boundaries', () => {
    const roles = ['user', 'bot', 'model', 'assistant'];
    const history = Array.from({ length: 20 }, (_, index) => ({
      role: roles[index % roles.length],
      text: index < 4 ? String(index).repeat(4000) : ''
    }));
    const req = { body: { message: 'hello', history } };
    const res = responseDouble();
    const next = jest.fn();

    validateChatbotPayload(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });
});

describe('createChatbotRateLimiter', () => {
  test('allows requests 1 through 40 and rejects request 41 for one user', () => {
    const limiter = createChatbotRateLimiter({
      limit: 40,
      windowMs: 900000,
      now: () => 1000
    });
    const req = { user: { id: 7 } };

    for (let requestNumber = 1; requestNumber <= 40; requestNumber += 1) {
      const res = responseDouble();
      const next = jest.fn();

      limiter(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);
    }

    const blockedResponse = responseDouble();
    const blockedNext = jest.fn();
    limiter(req, blockedResponse, blockedNext);

    expect(blockedResponse.statusCode).toBe(429);
    expect(blockedResponse.body).toEqual({
      error: 'Chatbot rate limit exceeded'
    });
    expect(blockedResponse.headers['RateLimit-Limit']).toBe('40');
    expect(blockedNext).not.toHaveBeenCalled();
  });

  test('keeps quota buckets independent for different user IDs', () => {
    const limiter = createChatbotRateLimiter({
      limit: 1,
      windowMs: 60000,
      now: () => 5000
    });

    const firstUserNext = jest.fn();
    limiter({ user: { id: 101 } }, responseDouble(), firstUserNext);
    expect(firstUserNext).toHaveBeenCalledTimes(1);

    const blockedResponse = responseDouble();
    limiter({ user: { id: 101 } }, blockedResponse, jest.fn());
    expect(blockedResponse.statusCode).toBe(429);

    const secondUserResponse = responseDouble();
    const secondUserNext = jest.fn();
    limiter({ user: { id: 202 } }, secondUserResponse, secondUserNext);

    expect(secondUserNext).toHaveBeenCalledTimes(1);
    expect(secondUserResponse.statusCode).toBe(200);
  });

  test('sets quota headers and resets the bucket at the window boundary', () => {
    let currentTime = 1000;
    const limiter = createChatbotRateLimiter({
      limit: 2,
      windowMs: 3000,
      now: () => currentTime
    });
    const req = { user: { id: 'reset-user' } };

    const firstResponse = responseDouble();
    limiter(req, firstResponse, jest.fn());
    expect(firstResponse.headers).toEqual({
      'RateLimit-Limit': '2',
      'RateLimit-Remaining': '1',
      'RateLimit-Reset': '3'
    });

    const secondResponse = responseDouble();
    limiter(req, secondResponse, jest.fn());
    expect(secondResponse.headers['RateLimit-Remaining']).toBe('0');

    currentTime = 3999;
    const beforeResetResponse = responseDouble();
    limiter(req, beforeResetResponse, jest.fn());
    expect(beforeResetResponse.statusCode).toBe(429);
    expect(beforeResetResponse.headers['RateLimit-Reset']).toBe('1');

    currentTime = 4000;
    const resetResponse = responseDouble();
    const resetNext = jest.fn();
    limiter(req, resetResponse, resetNext);

    expect(resetNext).toHaveBeenCalledTimes(1);
    expect(resetResponse.headers).toEqual({
      'RateLimit-Limit': '2',
      'RateLimit-Remaining': '1',
      'RateLimit-Reset': '3'
    });
  });

  test('sweeps expired buckets on a throttle without changing active counts', () => {
    let currentTime = 0;
    const limiter = createChatbotRateLimiter({
      limit: 2,
      windowMs: 100,
      now: () => currentTime
    });
    const call = (userId) => {
      const res = responseDouble();
      let nextCalls = 0;
      limiter({ user: { id: userId } }, res, () => { nextCalls += 1; });
      return { res, nextCalls };
    };

    call('stale-user');
    currentTime = 50;
    call('active-user');

    const iteratorSpy = jest.spyOn(Map.prototype, Symbol.iterator);
    const deleteSpy = jest.spyOn(Map.prototype, 'delete');

    try {
      currentTime = 75;
      call('before-sweep-1');
      currentTime = 99;
      call('before-sweep-2');
      const scansBeforeDeadline = iteratorSpy.mock.calls.length;

      currentTime = 100;
      call('sweep-trigger');
      const scansAfterDeadline = iteratorSpy.mock.calls.length;
      const deletedKeys = deleteSpy.mock.calls.map(([key]) => key);

      expect(scansBeforeDeadline).toBe(0);
      expect(scansAfterDeadline).toBe(1);
      expect(deletedKeys).toContain('stale-user');

      const activeSecond = call('active-user');
      const activeBlocked = call('active-user');
      expect(activeSecond.nextCalls).toBe(1);
      expect(activeBlocked.res.statusCode).toBe(429);
    } finally {
      iteratorSpy.mockRestore();
      deleteSpy.mockRestore();
    }
  });
});

describe('chatbotRateLimiter', () => {
  test('uses the production quota of 40 requests per 900,000 ms', () => {
    const req = { user: { id: 'singleton-40-per-15-minutes' } };
    let firstResponse;

    for (let requestNumber = 1; requestNumber <= 40; requestNumber += 1) {
      const res = responseDouble();
      const next = jest.fn();
      chatbotRateLimiter(req, res, next);
      firstResponse ||= res;
      expect(next).toHaveBeenCalledTimes(1);
    }

    expect(firstResponse.headers['RateLimit-Limit']).toBe('40');
    expect(firstResponse.headers['RateLimit-Reset']).toBe('900');

    const blockedResponse = responseDouble();
    chatbotRateLimiter(req, blockedResponse, jest.fn());
    expect(blockedResponse.statusCode).toBe(429);
  });
});
