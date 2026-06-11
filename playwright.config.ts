import { defineConfig, devices } from '@playwright/test';

// E2E smoke tests run against the real exported static build in `out/`.
// Build first with `npm run build`, then `npm run test:e2e`.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4321',
    headless: true,
    trace: 'off',
  },
  webServer: {
    command: 'node tests/static-server.mjs',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 20_000,
  },
  // Use the system-installed Microsoft Edge (Chromium) so no browser download is needed.
  // To use bundled Chromium instead, run `npx playwright install chromium` and set
  // `channel: undefined` below.
  projects: [
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],
});
