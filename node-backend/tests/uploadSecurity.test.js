const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

process.env.JWT_SECRET = 'upload-test-secret';

const uploadRouter = require('../routes/upload');

function tokenFor(id, role = 'admin') {
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
}

async function startServer() {
  const app = express();
  app.use('/upload', uploadRouter);

  const server = await new Promise((resolve) => {
    const listeningServer = app.listen(0, '127.0.0.1', () => resolve(listeningServer));
  });
  const { port } = server.address();

  return {
    baseUrl: `http://127.0.0.1:${port}/upload`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    }),
  };
}

describe('Upload Security & Validation', () => {
  let server;
  const tempDir = path.join(__dirname, '../public/uploads');

  beforeAll(async () => {
    server = await startServer();
  });

  afterAll(async () => {
    if (server) await server.close();
  });

  test('rejects unauthenticated requests with 401', async () => {
    const res = await fetch(server.baseUrl, {
      method: 'POST',
    });
    expect(res.status).toBe(401);
  });

  test('rejects non-admin role with 403', async () => {
    const customerToken = tokenFor('cust-1', 'customer');
    const res = await fetch(server.baseUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(res.status).toBe(403);
  });

  test('rejects file exceeding 2MB limit with 400', async () => {
    const adminToken = tokenFor('admin-1', 'admin');
    const formData = new FormData();
    // 2.5MB fake buffer
    const largeBuffer = new Uint8Array(2.5 * 1024 * 1024);
    // Give it valid PNG magic bytes so it only fails on size
    largeBuffer[0] = 0x89; largeBuffer[1] = 0x50; largeBuffer[2] = 0x4E; largeBuffer[3] = 0x47;
    const largeFile = new Blob([largeBuffer], { type: 'image/png' });
    formData.append('image', largeFile, 'large.png');

    const res = await fetch(server.baseUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/limit|exceed|2mb|large/i);
  });

  test('rejects disallowed file extensions (e.g. .svg, .php, .exe)', async () => {
    const adminToken = tokenFor('admin-1', 'admin');
    const formData = new FormData();
    const fakeFile = new Blob(['<svg></svg>'], { type: 'image/svg+xml' });
    formData.append('image', fakeFile, 'test.svg');

    const res = await fetch(server.baseUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/allowed|invalid/i);
  });

  test('rejects spoofed file with valid image extension but invalid magic bytes', async () => {
    const adminToken = tokenFor('admin-1', 'admin');
    const formData = new FormData();
    // Text content masquerading as a PNG
    const fakePng = new Blob(['This is just plain text, not a real PNG image!'], { type: 'image/png' });
    formData.append('image', fakePng, 'fake.png');

    const res = await fetch(server.baseUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/magic|signature|invalid/i);
  });

  test('accepts valid PNG image with PNG magic bytes', async () => {
    const adminToken = tokenFor('admin-1', 'admin');
    const formData = new FormData();
    // Valid PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52]);
    const validPng = new Blob([pngBytes], { type: 'image/png' });
    formData.append('image', validPng, 'valid.png');

    const res = await fetch(server.baseUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.url).toMatch(/^\/uploads\/article-/);

    // Clean up uploaded file
    const filename = path.basename(body.url);
    const fullPath = path.join(tempDir, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  });

  test('accepts valid JPEG image with JPEG magic bytes', async () => {
    const adminToken = tokenFor('admin-1', 'admin');
    const formData = new FormData();
    // Valid JPEG signature: FF D8 FF E0
    const jpegBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    const validJpeg = new Blob([jpegBytes], { type: 'image/jpeg' });
    formData.append('image', validJpeg, 'valid.jpg');

    const res = await fetch(server.baseUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    const filename = path.basename(body.url);
    const fullPath = path.join(tempDir, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  });

  test('accepts valid WEBP image with RIFF....WEBP signature', async () => {
    const adminToken = tokenFor('admin-1', 'admin');
    const formData = new FormData();
    // Valid WEBP signature: 'R','I','F','F', len(4 bytes), 'W','E','B','P'
    const webpBytes = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, // RIFF
      0x20, 0x00, 0x00, 0x00, // file length
      0x57, 0x45, 0x42, 0x50  // WEBP
    ]);
    const validWebp = new Blob([webpBytes], { type: 'image/webp' });
    formData.append('image', validWebp, 'valid.webp');

    const res = await fetch(server.baseUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    const filename = path.basename(body.url);
    const fullPath = path.join(tempDir, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  });
});
