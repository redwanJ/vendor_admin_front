import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL: 'http://localhost:3002/en',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 15000,
  },
  webServer: {
    command: 'npm run dev',
    cwd: __dirname,
    port: 3002,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
      NODE_ENV: 'development',
      // Default API URL used by the frontend. Tests mock network calls anyway.
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
