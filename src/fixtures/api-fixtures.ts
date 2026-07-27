import { test as base, request, type APIRequestContext } from '@playwright/test';
import { GistClient } from '../api/gist-client';
import { GistFactory } from './gist-factory';
import { withRequestLogging } from '../api/request-logger';
import { API_BASE_URL, GITHUB_API_HEADERS } from '../config/env';
import { otherTokenForWorker, tokenForWorker } from '../config/account-pool';

export async function newApiContext(token?: string): Promise<APIRequestContext> {
  const context = await request.newContext({
    baseURL: API_BASE_URL,
    extraHTTPHeaders: {
      ...GITHUB_API_HEADERS,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  // Every exchange lands in the reports as an attachment.
  return withRequestLogging(context);
}

interface ApiFixtures {
  anonApi: GistClient;
  gistFactory: GistFactory;
  secondApi: GistClient;
  secondGistFactory: GistFactory;
}

interface ApiWorkerFixtures {
  api: GistClient;
}

// noinspection JSVoidFunctionReturnValueUsed
export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  api: [
    async ({}, use, workerInfo) => {
      const context = await newApiContext(tokenForWorker(workerInfo.parallelIndex));
      await use(new GistClient(context));
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  anonApi: async ({}, use) => {
    const context = await newApiContext();
    await use(new GistClient(context));
    await context.dispose();
  },

  gistFactory: async ({ api }, use) => {
    const factory = new GistFactory(api);
    await use(factory);
    await factory.cleanup();
  },

  secondApi: async ({}, use, testInfo) => {
    const token = otherTokenForWorker(testInfo.parallelIndex);
    testInfo.skip(
      !token,
      'The account pool has a single account — cross-account tests are skipped. ' +
        'Provide GITHUB_TOKEN_2 (a gist-scoped PAT of another account) to enable them.',
    );
    const context = await newApiContext(token);
    await use(new GistClient(context));
    await context.dispose();
  },

  secondGistFactory: async ({ secondApi }, use) => {
    const factory = new GistFactory(secondApi);
    await use(factory);
    await factory.cleanup();
  },
});

export { expect } from '../assertions/expect';
