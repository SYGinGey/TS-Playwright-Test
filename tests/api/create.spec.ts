import * as allure from 'allure-js-commons';
import { test, expect } from '../../src/fixtures/api-fixtures';
import { expectGistMatchesPayload } from '../../src/assertions/gist-assertions';
import type { Gist } from '../../src/types/gist';

test.describe('POST /gists — create a gist', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist REST API');
    await allure.feature('Create gist');
    await allure.severity(allure.Severity.CRITICAL);
  });

  test('creates a secret gist with a single file', async ({ api, gistFactory }) => {
    const content = 'secret gist content'
    const payload = gistFactory.payload({
      public: false,
      files: { 'notes.md': { content} },
    });

    const response = await api.createGist(payload);
    await expect(response).toHaveStatus(201);

    const gist = (await response.json()) as Gist;
    gistFactory.track(gist.id);

    expectGistMatchesPayload(gist, payload);
  });

  test('creates a public gist', async ({ api, gistFactory }) => {
    const payload = gistFactory.payload({ public: true });

    const response = await api.createGist(payload);
    await expect(response).toHaveStatus(201);

    const gist = (await response.json()) as Gist;
    gistFactory.track(gist.id);

    expectGistMatchesPayload(gist, payload);
  });

  test('creates a gist with multiple files', async ({ api, gistFactory }) => {
    const payload = gistFactory.payload({
      files: {
        'readme.md': { content: '# Title' },
        'data.json': { content: '{"key": "value"}' },
        'script.js': { content: 'console.log(1);' },
      },
    });

    const response = await api.createGist(payload);
    await expect(response).toHaveStatus(201);

    const gist = (await response.json()) as Gist;
    gistFactory.track(gist.id);

    expectGistMatchesPayload(gist, payload);
    expect(gist.files['data.json']?.language).toBe('JSON');
  });

  test('creates a gist without a description', async ({ api, gistFactory }) => {
    const payload = gistFactory.payload();
    delete payload.description;

    const response = await api.createGist(payload);
    await expect(response).toHaveStatus(201);

    const gist = (await response.json()) as Gist;
    gistFactory.track(gist.id);

    expectGistMatchesPayload(gist, payload);
    expect([null, '']).toContain(gist.description);
  });
});
