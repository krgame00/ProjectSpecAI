const express = require('express');
const cors = require('cors');

describe('CORS Security Configuration', () => {
  const defaultAllowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://localhost:3000',
    'https://project-spec-ai.vercel.app'
  ];

  const createCorsHandler = (env = 'production', configuredOrigins = []) => {
    const allowedOrigins = [...defaultAllowedOrigins, ...configuredOrigins];

    const isAllowedOrigin = (origin) => {
      if (!origin) return true;
      if (env !== 'production') return true;
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return true;

      try {
        const url = new URL(origin);
        if (url.hostname.endsWith('.vercel.app') || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
          return true;
        }
      } catch {
        // Malformed origin
      }
      return false;
    };

    return (origin) => new Promise((resolve, reject) => {
      if (isAllowedOrigin(origin)) {
        return resolve(true);
      }
      return reject(new Error('Blocked by CORS policy: origin not allowed'));
    });
  };

  test('allows canonical production Vercel frontend in production', async () => {
    const checkOrigin = createCorsHandler('production');
    await expect(checkOrigin('https://project-spec-ai.vercel.app')).resolves.toBe(true);
  });

  test('allows Vercel branch preview deployment URLs in production', async () => {
    const checkOrigin = createCorsHandler('production');
    await expect(checkOrigin('https://project-spec-ai-git-main-krgame00.vercel.app')).resolves.toBe(true);
  });

  test('allows localhost in development and production', async () => {
    const checkOriginProd = createCorsHandler('production');
    const checkOriginDev = createCorsHandler('development');

    await expect(checkOriginProd('http://localhost:5173')).resolves.toBe(true);
    await expect(checkOriginDev('http://localhost:5173')).resolves.toBe(true);
  });

  test('allows non-browser requests without origin header (curl, mobile, tests)', async () => {
    const checkOrigin = createCorsHandler('production');
    await expect(checkOrigin(undefined)).resolves.toBe(true);
    await expect(checkOrigin(null)).resolves.toBe(true);
  });

  test('blocks unauthorized third-party origin in production', async () => {
    const checkOrigin = createCorsHandler('production');
    await expect(checkOrigin('https://malicious-site.com')).rejects.toThrow('Blocked by CORS policy');
  });

  test('respects custom origins configured via ALLOWED_ORIGINS', async () => {
    const checkOrigin = createCorsHandler('production', ['https://custom-domain.com']);
    await expect(checkOrigin('https://custom-domain.com')).resolves.toBe(true);
  });
});
