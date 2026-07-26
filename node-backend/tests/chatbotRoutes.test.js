const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'chatbot-routes-test-secret';
process.env.GCP_PROJECT = 'chatbot-routes-test-project';
delete process.env.GEMINI_API_KEY;

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContentStream: jest.fn().mockImplementation(async () => ({
        async *[Symbol.asyncIterator]() {
          yield { text: 'mock reply', candidates: [] };
        },
      })),
    },
  })),
}));

jest.mock('../config/db', () => ({
  query: jest.fn().mockResolvedValue([[]]),
}));

const chatbotRouter = require('../routes/chatbot');

function tokenFor(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));
  app.use('/chatbot', chatbotRouter);

  const server = await new Promise((resolve) => {
    const listeningServer = app.listen(0, '127.0.0.1', () => resolve(listeningServer));
  });
  const { port } = server.address();

  return {
    baseUrl: `http://127.0.0.1:${port}/chatbot`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    }),
  };
}

async function post(baseUrl, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('chatbot routes security', () => {
  let testServer;

  beforeAll(async () => {
    testServer = await startServer();
  });

  afterAll(async () => {
    await testServer.close();
  });

  test.each(['/message', '/stream', '/clear'])(
    'rejects unauthenticated requests to %s',
    async (path) => {
      const response = await post(testServer.baseUrl, path, {});

      expect(response.status).toBe(401);
    }
  );

  test('rejects stream text over 4,000 characters before Gemini processing', async () => {
    const response = await post(
      testServer.baseUrl,
      '/stream',
      { text: 'x'.repeat(4001) },
      tokenFor('oversized-user')
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Chatbot text exceeds 4,000 characters',
    });
  });

  test('does not charge clear requests against the AI quota', async () => {
    const token = tokenFor('clear-user');

    for (let attempt = 0; attempt < 41; attempt += 1) {
      const response = await post(
        testServer.baseUrl,
        '/clear',
        { sessionId: 'unknown-session' },
        token
      );

      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toEqual({
        error: 'Chat session not found',
      });
    }
  });

  test('returns the same 404 for unknown and foreign stream sessions', async () => {
    const unknownResponse = await post(
      testServer.baseUrl,
      '/stream',
      { text: 'hello', sessionId: 'not-created' },
      tokenFor('session-owner')
    );
    expect(unknownResponse.status).toBe(404);
    await expect(unknownResponse.json()).resolves.toEqual({
      error: 'Chat session not found',
    });

    const createdResponse = await post(
      testServer.baseUrl,
      '/stream',
      { text: 'create a session' },
      tokenFor('session-owner')
    );
    const createdBody = await createdResponse.text();
    const sessionId = JSON.parse(
      createdBody.match(/event: session\ndata: (.+)\n\n/)[1]
    ).sessionId;

    const foreignResponse = await post(
      testServer.baseUrl,
      '/stream',
      { text: 'steal session', sessionId },
      tokenFor('different-user')
    );

    expect(foreignResponse.status).toBe(404);
    await expect(foreignResponse.json()).resolves.toEqual({
      error: 'Chat session not found',
    });
  });

  test('creates a session and preserves stream SSE event names', async () => {
    const response = await post(
      testServer.baseUrl,
      '/stream',
      { text: 'new conversation' },
      tokenFor('stream-user')
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/event-stream');
    expect(body).toMatch(/event: session\ndata: {"sessionId":"[^"]+"}\n\n/);
    expect(body).toContain('data: {"text":"mock reply"}\n\n');
    expect(body).toContain('event: done\ndata: {}\n\n');
  });
});
