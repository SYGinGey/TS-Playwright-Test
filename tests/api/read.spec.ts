import * as allure from 'allure-js-commons';
import { test, expect } from '../../src/fixtures/api-fixtures';
import type { Gist } from '../../src/types/gist';

test.describe('GET /gists/{id} — read a gist', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist REST API');
    await allure.feature('Read gist');
    await allure.severity(allure.Severity.CRITICAL);
  });

  test('retrieves a gist with all key fields intact', async ({ api, gistFactory }) => {
    const content = 'print("hello")';
    const created = await gistFactory.create({
      files: { 'app.py': { content } },
    });

    const response = await api.getGist(created.id);
    await expect(response).toHaveStatus(200);

    const gist = (await response.json()) as Gist;
    expect(gist.id).toBe(created.id);
    expect(gist.description).toBe(created.description);
    expect(gist.public).toBe(false);
    expect(gist.created_at).toBe(created.created_at);
    expect(gist).toHaveFile('app.py', content);

    const file = gist.files['app.py']!;
    expect(file.language).toBe('Python');
    expect(file.truncated).toBe(false);
  });

  test('raw_url serves the exact file content', async ({ anonApi, gistFactory }) => {
    const content = 'line one\nline two\n';
    const gist = await gistFactory.create({
      public: true,
      files: { 'raw.txt': { content } },
    });

    const rawUrl = gist.files['raw.txt']?.raw_url;
    expect(rawUrl).toBeTruthy();

    const rawResponse = await anonApi.getAbsoluteUrl(rawUrl!);
    await expect(rawResponse).toHaveStatus(200);
    expect(await rawResponse.text()).toBe(content);
  });

  test('secret gist is readable by anyone who knows its id (secret ≠ private)', async ({
    anonApi,
    gistFactory,
  }) => {
    await allure.tag('security');

    const gist = await gistFactory.create({ public: false });

    const response = await anonApi.getGist(gist.id);
    await expect(response).toHaveStatus(200);

    const fetched = (await response.json()) as Gist;
    expect(fetched.id).toBe(gist.id);
  });
});
