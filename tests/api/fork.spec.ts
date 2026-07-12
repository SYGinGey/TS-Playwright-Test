import * as allure from 'allure-js-commons';
import { test, expect } from '../../src/fixtures/api-fixtures';
import type { Gist } from '../../src/types/gist';

test.describe('Gist forking', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist REST API');
    await allure.feature('Forking');
    await allure.severity(allure.Severity.NORMAL);
  });

  test('forking your own gist is rejected', async ({ api, gistFactory }) => {
    const gist = await gistFactory.create({ public: true });

    const response = await api.forkGist(gist.id);
    await expect(response).toHaveStatus(422);
  });

  test('forks a public gist of another user', async ({
    api,
    gistFactory,
    secondGistFactory,
  }) => {
    const content = 'content to fork';
    const original = await secondGistFactory.create({
      public: true,
      files: { 'forked.md': { content } },
    });

    const forkResponse = await api.forkGist(original.id);
    await expect(forkResponse).toHaveStatus(201);

    const fork = (await forkResponse.json()) as Gist;
    gistFactory.track(fork.id);
    expect(fork.id).not.toBe(original.id);

    const full = (await (await api.getGist(fork.id)).json()) as Gist;
    expect(full.fork_of?.id).toBe(original.id);
    expect(full.owner?.login).not.toBe(original.owner?.login);
    expect(full).toHaveFile('forked.md', content);
  });

  test('a secret gist of another user can be forked by anyone who knows its id', async ({
    api,
    gistFactory,
    secondGistFactory,
  }) => {
    await allure.tag('security');
    const original = await secondGistFactory.create({ public: false });

    const response = await api.forkGist(original.id);
    await expect(response).toHaveStatus(201);

    const fork = (await response.json()) as Gist;
    gistFactory.track(fork.id);

    const full = (await (await api.getGist(fork.id)).json()) as Gist;
    expect(full.public).toBe(false);
    expect(full.fork_of?.id).toBe(original.id);
  });
});

test.describe('Permissions on another user\'s gist', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist REST API');
    await allure.feature('Error handling');
    await allure.severity(allure.Severity.CRITICAL);
    await allure.tag('security');
  });

  test('updating another user\'s gist returns 404 and leaves it unchanged', async ({
    api,
    secondApi,
    secondGistFactory,
  }) => {
    const foreign = await secondGistFactory.create();

    const response = await api.updateGist(foreign.id, { description: 'should not happen' });
    await expect(response).toHaveStatus(404);

    const unchanged = (await (await secondApi.getGist(foreign.id)).json()) as Gist;
    expect(unchanged.description).toBe(foreign.description);
  });

  test('deleting another user\'s gist returns 404 and leaves it intact', async ({
    api,
    secondApi,
    secondGistFactory,
  }) => {
    const foreign = await secondGistFactory.create();

    const response = await api.deleteGist(foreign.id);
    await expect(response).toHaveStatus(404);

    await expect(await secondApi.getGist(foreign.id)).toHaveStatus(200);
  });
});
