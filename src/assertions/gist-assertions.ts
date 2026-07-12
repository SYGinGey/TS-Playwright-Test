import { expect } from './expect';
import type { CreateGistPayload, Gist } from '../types/gist';

export function expectGistMatchesPayload(gist: Gist, payload: CreateGistPayload): void {
  expect(gist.id, 'gist id must be present').toBeTruthy();

  expect.soft(gist.html_url).toContain(gist.id);
  expect.soft(gist.public).toBe(payload.public ?? false);
  expect.soft(gist.owner?.login, 'gist owner').toBeTruthy();
  if (payload.description !== undefined) {
    expect.soft(gist.description).toBe(payload.description);
  }

  expect.soft(Object.keys(gist.files).sort()).toEqual(Object.keys(payload.files).sort());
  for (const [filename, { content }] of Object.entries(payload.files)) {
    expect.soft(gist).toHaveFile(filename, content);
  }
}
