import fs from 'node:fs';
import path from 'node:path';
import * as OTPAuth from 'otpauth';
import { test as setup, expect, devices } from '@playwright/test';
import { STORAGE_STATE_PATH } from '../../src/config/env';

const EMPTY_STATE = JSON.stringify({ cookies: [], origins: [] });
const TOTP_ATTEMPTS = 2;

setup('authenticate to GitHub', async ({ browser, page }) => {
  if (await savedSessionIsValid(browser)) return;

  const user = process.env.GH_UI_USER;
  const password = process.env.GH_UI_PASSWORD;
  const totpSecret = process.env.GH_UI_TOTP_SECRET;

  if (!user || !password || !totpSecret) {
    writeState(EMPTY_STATE);
    console.warn(
      'No valid saved session and no GH_UI_* credentials — UI tests will be skipped. ' +
        'Provide GH_UI_USER/GH_UI_PASSWORD/GH_UI_TOTP_SECRET (see .env.example).',
    );
    return;
  }

  await page.goto('https://github.com/login');
  await page.getByRole('textbox', { name: /username or email address/i }).fill(user);
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await enterTotpCode(page, totpSecret);

  await expect(page.locator('meta[name="user-login"]')).toHaveAttribute('content', /.+/, {
    timeout: 30_000,
  });

  await page.goto('https://gist.github.com/');
  await expect(page.locator('meta[name="user-login"]')).toHaveAttribute('content', /.+/);

  fs.mkdirSync(path.dirname(STORAGE_STATE_PATH), { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE_PATH });
});

async function savedSessionIsValid(browser: import('@playwright/test').Browser): Promise<boolean> {
  if (!fs.existsSync(STORAGE_STATE_PATH)) return false;

  const context = await browser.newContext({
    ...devices['Desktop Chrome'],
    storageState: STORAGE_STATE_PATH,
  });
  try {
    const probe = await context.newPage();
    await probe.goto('https://gist.github.com/');
    const login = await probe.locator('meta[name="user-login"]').getAttribute('content');
    return !!login;
  } catch {
    return false;
  } finally {
    await context.close();
  }
}

async function enterTotpCode(
  page: import('@playwright/test').Page,
  secret: string,
): Promise<void> {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret.replace(/\s+/g, '').toUpperCase()),
    digits: 6,
    period: 30,
  });

  const totpInput = page.locator('#app_totp');
  await totpInput.waitFor({ timeout: 15_000 });

  for (let attempt = 1; attempt <= TOTP_ATTEMPTS; attempt++) {
    await totpInput.fill(totp.generate());
    try {
      await page.waitForURL((url) => !url.pathname.includes('/sessions/two-factor'), {
        timeout: 10_000,
      });
      return;
    } catch {
      if (attempt === TOTP_ATTEMPTS) throw new Error('TOTP verification did not succeed');
      await totpInput.clear();
    }
  }
}

function writeState(content: string): void {
  fs.mkdirSync(path.dirname(STORAGE_STATE_PATH), { recursive: true });
  fs.writeFileSync(STORAGE_STATE_PATH, content);
}
