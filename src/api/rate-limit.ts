import type { APIResponse } from '@playwright/test';

/** GitHub throttles with both of these. */
const THROTTLED_STATUSES = [403, 429];

/** Prefix the Allure category and any log grep rely on — keep it in sync with playwright.config.ts. */
export const RATE_LIMIT_MARKER = 'RATE LIMIT';

export function rateLimitNote(response: APIResponse): string | undefined {
  if (!THROTTLED_STATUSES.includes(response.status())) return undefined;

  const headers = response.headers();

  const retryAfter = headers['retry-after'];
  if (retryAfter) {
    return (
      `${RATE_LIMIT_MARKER} — secondary limit: GitHub asks to retry after ${retryAfter}s. ` +
      'The product is fine, the suite is bursting too fast.'
    );
  }

  if (headers['x-ratelimit-remaining'] === '0') {
    const limit = headers['x-ratelimit-limit'] ?? 'unknown';
    return (
      `${RATE_LIMIT_MARKER} — primary limit: the quota of ${limit} requests/hour is used up, ` +
      `resets ${resetHint(headers['x-ratelimit-reset'])}. ` +
      'The product is fine, the account is out of budget.'
    );
  }

  return undefined;
}

function resetHint(reset: string | undefined): string {
  const epochSeconds = Number(reset);
  if (!reset || Number.isNaN(epochSeconds)) return 'at an unknown time';

  const at = new Date(epochSeconds * 1000);
  const minutes = Math.ceil(Math.max(0, at.getTime() - Date.now()) / 60_000);
  return `at ${at.toISOString()} (in ~${minutes} min)`;
}
