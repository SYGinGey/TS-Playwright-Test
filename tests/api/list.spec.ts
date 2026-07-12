import * as allure from 'allure-js-commons';
import { test, expect } from '../../src/fixtures/api-fixtures';
import { readJson } from '../../src/assertions/read-json';
import type { Gist } from '../../src/types/gist';

test.describe('GET /gists — listing and pagination', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist REST API');
    await allure.feature('Listing and pagination');
    await allure.severity(allure.Severity.NORMAL);
  });

  test('lists gists of the authenticated user including a fresh one', async ({
    api,
    gistFactory,
  }) => {
    const gist = await gistFactory.create();

    const response = await api.listGists({ per_page: 100 });
    await expect(response).toHaveStatus(200);

    const gists = (await response.json()) as Gist[];
    expect(gists.map((g) => g.id)).toContain(gist.id);
    const listed = gists.find((g) => g.id === gist.id)!;
    // The list endpoint returns file metadata but omits the contents.
    expect(listed).toHaveFile('notes.md');
    expect(listed.files['notes.md']!.content).toBeUndefined();
  });

  test('per_page limits the page size and Link header exposes the next page', async ({
    api,
    gistFactory,
  }) => {
    await gistFactory.create();
    await gistFactory.create();

    const response = await api.listGists({ per_page: 1, page: 1 });
    await expect(response).toHaveStatus(200);

    const gists = (await response.json()) as Gist[];
    expect(gists).toHaveLength(1);

    const linkHeader = response.headers()['link'];
    expect(linkHeader).toBeTruthy();
    expect(linkHeader).toContain('rel="next"');
  });

  test('consecutive pages return different gists', async ({ api, gistFactory }) => {
    await gistFactory.create();
    await gistFactory.create();

    await expect(async () => {
      const first = await readJson<Gist[]>(await api.listGists({ per_page: 1, page: 1 }));
      const second = await readJson<Gist[]>(await api.listGists({ per_page: 1, page: 2 }));

      expect(first, 'page 1 must contain exactly one gist').toHaveLength(1);
      expect(second, 'page 2 must contain exactly one gist').toHaveLength(1);
      expect(first[0]!.id, 'consecutive pages must not return the same gist').not.toBe(
        second[0]!.id,
      );
    }).toPass({ timeout: 15_000 });
  });

  test('since filter excludes gists updated before the given timestamp', async ({
    api,
    gistFactory,
  }) => {
    const gist = await gistFactory.create();

    const beforeCreation = new Date(Date.parse(gist.created_at) - 1000).toISOString();
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const recent = await readJson<Gist[]>(
      await api.listGists({ since: beforeCreation, per_page: 100 }),
    );
    expect(recent.map((g) => g.id)).toContain(gist.id);

    const afterFuture = await readJson<Gist[]>(
      await api.listGists({ since: future, per_page: 100 }),
    );
    expect(afterFuture.map((g) => g.id)).not.toContain(gist.id);
  });

  test('public gists feed is available and contains only public gists', async ({ api }) => {
    const response = await api.listPublicGists({ per_page: 10 });
    await expect(response).toHaveStatus(200);

    const gists = (await response.json()) as Gist[];
    expect(gists.length).toBeGreaterThan(0);
    for (const gist of gists) {
      expect(gist.public).toBe(true);
    }
  });
});
