import {test} from "../../src/fixtures/api-fixtures";
import * as allure from "allure-js-commons";
import {expect} from "../../src/assertions/expect";
import type {GistComment} from "../../src/types/gist";
import {readJson} from "../../src/assertions/read-json";

test.describe('Gist comments', () => {
  test.beforeEach(async () => {
    await allure.epic('Gist REST API');
    await allure.feature('Gist comments');
    await allure.severity(allure.Severity.CRITICAL);
  });

  test('pass the livecycle of a gist comment', async ({api, gistFactory}) => {
    const body = 'secret gist content';
    const updatedBody = 'updated';
    const gist = await gistFactory.create();

    const gistComment = await readJson<GistComment>(await api.createGistComment(gist.id, { body }), 201);

    const updatedComment = await readJson<GistComment>(await api.updateGistComment(gist.id, gistComment.id, { body: updatedBody }));
    const deleteGistComment = await api.deleteGistComment(gist.id, gistComment.id);
    const getGistComment = await api.getGistComment(gist.id, gistComment.id);

    expect(deleteGistComment.status(), 'delete status is correct').toEqual(204);
    expect(getGistComment.status(), "can't find deleted comment").toEqual(404);
    expect(updatedComment.body, "comment has been updated").toEqual(updatedBody);
  });

  test('deleting foreigner gist comment is prohibited', async ({api, secondApi, gistFactory}) => {
    const body = 'secret gist content';
    const updatedBody = 'updated';
    const gist = await gistFactory.create();

    const gistComment = await readJson<GistComment>(await api.createGistComment(gist.id, { body }), 201);
    const updatedComment = await secondApi.updateGistComment(gist.id, gistComment.id, { body: updatedBody });
    const deletedComment = await secondApi.deleteGistComment(gist.id, gistComment.id);
    const getComment = await readJson<GistComment>(await api.getGistComment(gist.id, gistComment.id));

    expect(updatedComment.status(), "can't change a foreigner comment").toEqual(404);
    expect(deletedComment.status(), "can't delete a foreigner comment").toEqual(404);
    expect(getComment.body, "comment exists and not updated").toEqual(body);
  });
});
