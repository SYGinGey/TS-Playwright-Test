import { randomUUID } from 'node:crypto';
import * as allure from 'allure-js-commons';
import { test, expect } from '../../src/fixtures/ui-fixtures';

test.describe('API-created data appears correctly in the UI', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist Web UI');
    await allure.feature('API/UI consistency');
    await allure.severity(allure.Severity.NORMAL);
  });

  test('a gist created through the API renders on its web page', async ({
    page,
    viewPage,
    gistFactory,
  }) => {
    const content = `api-created content ${randomUUID()}`;
    const gist = await gistFactory.create({
      public: true,
      files: { 'from-api.md': { content } },
    });

    await viewPage.goto(gist.html_url);

    await expect(page.getByText(gist.description!)).toBeVisible();
    await expect(viewPage.fileHeader('from-api.md')).toBeVisible();
    await expect(viewPage.contentText(content)).toBeVisible();
  });
});
