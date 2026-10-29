import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173/chess/',
    browserName: 'chromium',
    trace: 'retain-on-failure',
    // Optional for sandbox environments; CI uses Playwright's installed Chromium.
    launchOptions: process.env.CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] }
      : {},
  },
  webServer: {
    command: 'npm run preview -- --base=/chess/ --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/chess/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
