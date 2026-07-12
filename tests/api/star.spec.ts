import * as allure from 'allure-js-commons';
import { test, expect } from '../../src/fixtures/api-fixtures';
import type { Gist } from '../../src/types/gist';

test.describe('Gist starring', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist REST API');
    await allure.feature('Starring');
    await allure.severity(allure.Severity.NORMAL);
  });

  test('star / check / unstar lifecycle', async ({ api, gistFactory }) => {
    const gist = await gistFactory.create();

    await test.step('a fresh gist is not starred', async () => {
      await expect(await api.checkGistStarred(gist.id)).toHaveStatus(404);
    });

    await test.step('star the gist (idempotent PUT, empty body)', async () => {
      await expect(await api.starGist(gist.id)).toHaveStatus(204);
      await expect(await api.checkGistStarred(gist.id)).toHaveStatus(204);
    });

    await test.step('the gist appears in the starred list', async () => {
      const starredResponse = await api.listStarredGists({ per_page: 100 });
      await expect(starredResponse).toHaveStatus(200);
      const starred = (await starredResponse.json()) as Gist[];
      expect(starred.map((g) => g.id)).toContain(gist.id);
    });

    await test.step('unstar the gist', async () => {
      await expect(await api.unstarGist(gist.id)).toHaveStatus(204);
      await expect(await api.checkGistStarred(gist.id)).toHaveStatus(404);
    });
  });

  test('starring an already starred gist is idempotent', async ({ api, gistFactory }) => {
    const gist = await gistFactory.create();

    await expect(await api.starGist(gist.id)).toHaveStatus(204);
    await expect(await api.starGist(gist.id)).toHaveStatus(204);
    await expect(await api.checkGistStarred(gist.id)).toHaveStatus(204);
  });
});
