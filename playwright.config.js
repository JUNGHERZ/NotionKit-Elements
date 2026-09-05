import { defineConfig } from '@playwright/test';

// The suite runs against the repository root served statically: dist/ (the
// built bundles), node_modules/@jungherz-de/notionkit (the peer stylesheet)
// and test/fixtures/. Build first: `npm run build && npm test`.
export default defineConfig({
  testDir: 'test',
  testMatch: /.*\.spec\.mjs/,
  outputDir: 'test/.artifacts/results',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1100, height: 800 },
    deviceScaleFactor: 1,
  },
  webServer: {
    command: 'node test/server.mjs 4173',
    url: 'http://127.0.0.1:4173/package.json',
    reuseExistingServer: true,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
