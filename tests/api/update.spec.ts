import * as allure from 'allure-js-commons';
import { test, expect } from '../../src/fixtures/api-fixtures';
import type { Gist, GistHistoryEntry } from '../../src/types/gist';

test.describe('PATCH /gists/{id} — update a gist', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist REST API');
    await allure.feature('Update gist');
    await allure.severity(allure.Severity.CRITICAL);
  });

  test('updates the description without touching files', async ({ api, gistFactory }) => {
    const gist = await gistFactory.create();
    const newDescription = `${gist.description} (updated)`;

    const response = await api.updateGist(gist.id, { description: newDescription });
    await expect(response).toHaveStatus(200);

    const updated = (await response.json()) as Gist;
    expect(updated.description).toBe(newDescription);
    expect(Object.keys(updated.files)).toEqual(Object.keys(gist.files));
  });

  test('updates file content', async ({ api, gistFactory }) => {
    const gist = await gistFactory.create({
      files: { 'notes.md': { content: 'original' } },
    });

    const newContent = 'changed content';
    const response = await api.updateGist(gist.id, {
      files: { 'notes.md': { content: newContent } },
    });
    await expect(response).toHaveStatus(200);

    const updated = (await response.json()) as Gist;
    expect(updated).toHaveFile('notes.md', newContent);
  });

  test('renames a file keeping its content', async ({ api, gistFactory }) => {
    const content = 'stable content';
    const gist = await gistFactory.create({
      files: { 'old-name.md': { content } },
    });

    const response = await api.updateGist(gist.id, {
      files: { 'old-name.md': { filename: 'new-name.md' } },
    });
    await expect(response).toHaveStatus(200);

    const updated = (await response.json()) as Gist;
    expect(updated).toHaveFile('new-name.md', content);
    expect(updated).not.toHaveFile('old-name.md');
  });

  test('adds a new file and deletes an existing one in a single update', async ({
    api,
    gistFactory,
  }) => {
    const gist = await gistFactory.create({
      files: {
        'keep.md': { content: 'keep me' },
        'remove.md': { content: 'remove me' },
      },
    });

    const addedContent = 'brand new';
    const response = await api.updateGist(gist.id, {
      files: {
        'remove.md': null,
        'added.md': { content: addedContent },
      },
    });
    await expect(response).toHaveStatus(200);

    const updated = (await response.json()) as Gist;
    expect(Object.keys(updated.files).sort()).toEqual(['added.md', 'keep.md']);
    expect(updated).toHaveFile('added.md', addedContent);
  });
});

test.describe('Gist revisions', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist REST API');
    await allure.feature('Revisions');
    await allure.severity(allure.Severity.NORMAL);
  });

  test('every update creates a new revision; old revisions stay readable', async ({
    api,
    gistFactory,
  }) => {
    const initialContent = 'version 1';

    const gist = await test.step('create a gist with initial content', () =>
      gistFactory.create({ files: { 'versioned.md': { content: initialContent } } }));

    await test.step('update the file content', async () => {
      const updateResponse = await api.updateGist(gist.id, {
        files: { 'versioned.md': { content: 'version 2' } },
      });
      await expect(updateResponse).toHaveStatus(200);
    });

    const commits = await test.step('the gist now has two commits', async () => {
      const commitsResponse = await api.listCommits(gist.id);
      await expect(commitsResponse).toHaveStatus(200);
      const entries = (await commitsResponse.json()) as GistHistoryEntry[];
      expect(entries).toHaveLength(2);
      return entries;
    });

    await test.step('the original revision still serves the old content', async () => {
      // Commits are returned newest first; the last one is the original.
      const firstRevisionSha = commits[commits.length - 1]!.version;
      const revisionResponse = await api.getRevision(gist.id, firstRevisionSha);
      await expect(revisionResponse).toHaveStatus(200);

      const revision = (await revisionResponse.json()) as Gist;
      expect(revision).toHaveFile('versioned.md', initialContent);
    });
  });
});
