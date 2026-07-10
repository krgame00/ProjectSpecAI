import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.js',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'npm start',
      cwd: '../node-backend',
      port: 3000,
      timeout: 30000,
      reuseExistingServer: true,
      env: {
        NODE_ENV: 'development',
        JWT_SECRET: 'pcspec_test_secret_2026',
        DB_HOST: '',
      },
    },
    {
      command: 'npx vite --port 5173',
      cwd: '.',
      port: 5173,
      timeout: 30000,
      reuseExistingServer: true,
    },
  ],
});
