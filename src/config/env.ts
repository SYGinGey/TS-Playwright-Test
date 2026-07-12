export const API_BASE_URL = process.env.GIST_API_URL ?? 'https://api.github.com';
export const GIST_WEB_URL = 'https://gist.github.com';
export const STORAGE_STATE_PATH = '.auth/user.json';
export const TEST_GIST_PREFIX = '[gist-e2e]';
export const RUN_ID = process.env.GIST_RUN_ID;
export const GIST_DESCRIPTION_PREFIX = RUN_ID
  ? `${TEST_GIST_PREFIX}[run-${RUN_ID}]`
  : TEST_GIST_PREFIX;

export function requireToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      'GITHUB_TOKEN environment variable is not set. ' +
        'Create a token with the "gist" scope and put it into .env (see .env.example).',
    );
  }
  return token;
}
