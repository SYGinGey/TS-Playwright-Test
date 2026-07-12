import { randomUUID } from 'node:crypto';
import * as allure from 'allure-js-commons';
import { test, expect } from '../../src/fixtures/ui-fixtures';
import { GistViewPage } from '../../src/ui/pages/gist-view-page';
import { GIST_DESCRIPTION_PREFIX } from '../../src/config/env';

test.describe('Create a gist via the web UI', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist Web UI');
    await allure.feature('Create gist via UI');
    await allure.severity(allure.Severity.CRITICAL);
  });

  test('creates a secret gist and lands on its page', async ({
    page,
    createPage,
    viewPage,
    gistFactory,
  }) => {
    const description = `${GIST_DESCRIPTION_PREFIX} ui-created ${randomUUID()}`;
    const content = `unique ui content ${randomUUID()}`;

    await test.step('fill in the gist editor form', async () => {
      await createPage.goto();
      await createPage.editor.fill({
        description,
        filename: 'ui-notes.md',
        content,
      });
    });

    await test.step('submit and land on the new gist page', async () => {
      await createPage.editor.createSecretGist();
      await expect(page).toHaveURL(GistViewPage.URL_PATTERN);
      gistFactory.track(viewPage.gistIdFromUrl());
    });

    await test.step('the gist page shows the entered data', async () => {
      await expect(page.getByText(description)).toBeVisible();
      await expect(viewPage.fileHeader('ui-notes.md')).toBeVisible();
      await expect(viewPage.contentText(content)).toBeVisible();
    });
  });
});
