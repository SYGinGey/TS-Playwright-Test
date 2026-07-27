import { expect as baseExpect } from '@playwright/test';
import type { APIResponse } from '@playwright/test';
import type { Gist } from '../types/gist';
import { rateLimitNote } from '../api/rate-limit';

export const expect = baseExpect.extend({
  // eslint-disable-next-line @typescript-eslint/require-await
  async toHaveStatus(response: APIResponse, expected: number) {
    const pass = response.status() === expected;
    if (pass) {
      return {
        pass,
        message: () => `expected status not to be ${expected} for ${response.url()}`,
      };
    }

    const note = rateLimitNote(response);
    return {
      pass,
      message: () =>
        (note ? `${note}\n\n` : '') +
        `expected status ${expected}, received ${response.status()} ${response.statusText()} ` +
        `for ${response.url()} — see the attached exchange`,
    };
  },

  toHaveFile(gist: Gist, filename: string, content?: string) {
    const file = gist.files[filename];

    if (!file) {
      const present = Object.keys(gist.files).join(', ') || '(none)';
      return {
        name: 'toHaveFile',
        pass: false,
        message: () =>
          `expected gist ${gist.id} to have a file "${filename}", but its files are: ${present}`,
      };
    }

    if (content === undefined) {
      return {
        name: 'toHaveFile',
        pass: true,
        message: () => `expected gist ${gist.id} not to have a file "${filename}"`,
      };
    }

    const pass = file.content === content;
    return {
      name: 'toHaveFile',
      pass,
      expected: content,
      actual: file.content,
      message: () =>
        pass
          ? `expected "${filename}" not to have content ${JSON.stringify(content)}`
          : `expected "${filename}" to have content ${JSON.stringify(content)}, ` +
            `received ${JSON.stringify(file.content)}`,
    };
  },
});
