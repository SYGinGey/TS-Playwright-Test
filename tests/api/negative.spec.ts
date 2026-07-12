import * as allure from 'allure-js-commons';
import { test, expect } from '../../src/fixtures/api-fixtures';
import { newApiContext } from '../../src/fixtures/api-fixtures';
import { GistClient } from '../../src/api/gist-client';
import type { Gist } from '../../src/types/gist';

const NON_EXISTENT_GIST_ID = 'a'.repeat(32);

test.describe('Authentication and authorization errors', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist REST API');
    await allure.feature('Error handling');
    await allure.severity(allure.Severity.CRITICAL);
    await allure.tag('security');
  });

  test('creating a gist without a token returns 401', async ({ anonApi }) => {
    const response = await anonApi.createGist({
      description: 'should never be created',
      files: { 'x.txt': { content: 'x' } },
    });
    await expect(response).toHaveStatus(401);
  });

  test('creating a gist with an invalid token returns 401', async () => {
    const context = await newApiContext('ghp_definitely_invalid_token');
    const client = new GistClient(context);
    try {
      const response = await client.createGist({
        files: { 'x.txt': { content: 'x' } },
      });
      await expect(response).toHaveStatus(401);
    } finally {
      await context.dispose();
    }
  });

  test('deleting a gist anonymously returns 401 and leaves the gist intact', async ({
    api,
    anonApi,
    gistFactory,
  }) => {
    const gist = await gistFactory.create();

    const response = await anonApi.deleteGist(gist.id);
    await expect(response).toHaveStatus(401);
    await expect(await api.getGist(gist.id)).toHaveStatus(200);
  });

  test('updating a gist anonymously returns 401 and leaves the gist unchanged', async ({
    api,
    anonApi,
    gistFactory,
  }) => {
    const gist = await gistFactory.create();

    const response = await anonApi.updateGist(gist.id, { description: 'hacked' });
    await expect(response).toHaveStatus(401);

    const unchanged = (await (await api.getGist(gist.id)).json()) as Gist;
    expect(unchanged.description).toBe(gist.description);
  });
});

test.describe('Malformed payloads', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist REST API');
    await allure.feature('Error handling');
    await allure.severity(allure.Severity.CRITICAL);
    await allure.tag('validation');
  });

  test('creating a gist without files returns 422', async ({ api }) => {
    const response = await api.createGistRaw({ description: 'no files at all' });
    await expect(response).toHaveStatus(422);
  });

  test('creating a gist with an empty files object returns 422', async ({ api }) => {
    const response = await api.createGistRaw({ files: {} });
    await expect(response).toHaveStatus(422);
  });

  test('validation error body names the failing field', async ({ api }) => {
    const response = await api.createGistRaw({ files: {} });
    await expect(response).toHaveStatus(422);

    const body = (await response.json()) as { message: string; errors?: unknown[] };
    expect(body.message).toContain('Validation Failed');
    expect(Array.isArray(body.errors)).toBe(true);
    expect(body.errors!.length).toBeGreaterThan(0);
  });
});

test.describe('Missing resources', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist REST API');
    await allure.feature('Error handling');
    await allure.severity(allure.Severity.NORMAL);
  });

  test('retrieving a non-existent gist returns 404', async ({ api }) => {
    const response = await api.getGist(NON_EXISTENT_GIST_ID);
    await expect(response).toHaveStatus(404);
  });

  test('updating a non-existent gist returns 404', async ({ api }) => {
    const response = await api.updateGist(NON_EXISTENT_GIST_ID, { description: 'x' });
    await expect(response).toHaveStatus(404);
  });

  test('deleting a non-existent gist returns 404', async ({ api }) => {
    const response = await api.deleteGist(NON_EXISTENT_GIST_ID);
    await expect(response).toHaveStatus(404);
  });

  test('starring a non-existent gist returns 404', async ({ api }) => {
    const response = await api.starGist(NON_EXISTENT_GIST_ID);
    await expect(response).toHaveStatus(404);
  });
});
