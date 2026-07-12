import { randomUUID } from 'node:crypto';
import * as allure from 'allure-js-commons';
import { test, expect } from '../../src/fixtures/ui-fixtures';

test.describe('Edit a gist via the web UI', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist Web UI');
    await allure.feature('Edit gist via UI');
    await allure.severity(allure.Severity.CRITICAL);
  });

  test('edits the description and content of an API-created gist', async ({
    page,
    editorForm,
    viewPage,
    gistFactory,
  }) => {
    const gist = await gistFactory.create({
      files: { 'edit-me.md': { content: 'original content' } },
    });
    const updatedDescription = `${gist.description} — edited via UI ${randomUUID()}`;
    const updatedContent = `replaced via UI ${randomUUID()}`;

    await viewPage.goto(gist.html_url);
    await viewPage.editButton().click();

    await editorForm.descriptionInput.fill(updatedDescription);
    await editorForm.typeContent(updatedContent);
    await editorForm.updateGist();

    await expect(page).toHaveURL(new RegExp(gist.id));
    await expect(page.getByText(updatedDescription)).toBeVisible();
    await expect(async () => {
      await page.reload();
      await expect(viewPage.contentText(updatedContent)).toBeVisible({ timeout: 2_000 });
      await expect(page.getByText('original content')).toBeHidden();
    }).toPass({ timeout: 15_000 });
  });
});
