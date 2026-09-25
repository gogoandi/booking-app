import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  // Browser tests run separately from the unit and integration suites.
  testMatch: '**/*.e2e.ts',
  forbidOnly: !!process.env['CI'],
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4201',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run start -- --host 127.0.0.1 --port 4201',
    url: 'http://127.0.0.1:4201/login',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
