import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { tokenPool } from './src/config/account-pool';
import { devices } from '@playwright/test';
import { GIST_WEB_URL, STORAGE_STATE_PATH } from './src/config/env';
import { RATE_LIMIT_MARKER } from './src/api/rate-limit';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  globalSetup: './scripts/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 4 * Math.max(tokenPool().length, 1),
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        categories: [
          {
            name: 'GitHub rate limit — not a product defect',
            description:
              'The suite exhausted the API quota of the account. Re-run once the limit ' +
              'resets, or add another account to the pool (GITHUB_TOKEN_2, …).',
            messageRegex: `(?s).*${RATE_LIMIT_MARKER}.*`,
            matchedStatuses: ['failed', 'broken'],
          },
        ],
      },
    ],
    ...(process.env.CI ? ([['github']] as const) : []),
  ],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
    },
    {
      name: 'ui-setup',
      testDir: './tests/ui',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      testIgnore: /auth\.setup\.ts/,
      dependencies: ['ui-setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: GIST_WEB_URL,
        storageState: STORAGE_STATE_PATH,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
      },
    },
  ],
});
