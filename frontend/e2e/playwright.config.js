import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = path.resolve(frontendDir, '..', 'node-backend');
const frontendPort = process.env.E2E_FRONTEND_PORT || '5173';
const backendPort = process.env.E2E_BACKEND_PORT || '3001';
const apiBase = process.env.E2E_API_BASE || `http://127.0.0.1:${backendPort}/api/v1`;

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.js',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 1,
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'npm start',
      cwd: backendDir,
      url: `${apiBase}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        ...process.env,
        PORT: backendPort,
        JWT_SECRET: process.env.JWT_SECRET || 'pcspec_test_secret_2026',
        AUTH_RATE_LIMIT_MAX: '1000',
      },
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${frontendPort}`,
      cwd: frontendDir,
      url: `http://127.0.0.1:${frontendPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        ...process.env,
        VITE_API_BASE: apiBase,
      },
    },
  ],
});
