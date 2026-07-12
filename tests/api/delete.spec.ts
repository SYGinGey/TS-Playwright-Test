import * as allure from 'allure-js-commons';
import { test, expect } from '../../src/fixtures/api-fixtures';

test.describe('DELETE /gists/{id} — delete a gist', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist REST API');
    await allure.feature('Delete gist');
    await allure.severity(allure.Severity.CRITICAL);
  });

  test('deletes a gist and it can no longer be retrieved', async ({ api, gistFactory }) => {
    const gist = await gistFactory.create();

    const deleteResponse = await api.deleteGist(gist.id);
    await expect(deleteResponse).toHaveStatus(204);

    const getResponse = await api.getGist(gist.id);
    await expect(getResponse).toHaveStatus(404);
  });

  test('deleting the same gist twice returns 404', async ({ api, gistFactory }) => {
    const gist = await gistFactory.create();

    await expect(await api.deleteGist(gist.id)).toHaveStatus(204);
    await expect(await api.deleteGist(gist.id)).toHaveStatus(404);
  });
});
