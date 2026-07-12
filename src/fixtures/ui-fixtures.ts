import fs from 'node:fs';
import { test as base } from '@playwright/test';
import { GistClient } from '../api/gist-client';
import { GistFactory } from './gist-factory';
import { newApiContext } from './api-fixtures';
import { requireToken, STORAGE_STATE_PATH } from '../config/env';
import { GistCreatePage } from '../ui/pages/gist-create-page';
import { GistViewPage } from '../ui/pages/gist-view-page';
import { GistEditorForm } from '../ui/components/gist-editor-form';

interface UiFixtures {
  authSession: void;
  gistFactory: GistFactory;
  createPage: GistCreatePage;
  editorForm: GistEditorForm;
  viewPage: GistViewPage;
}

interface UiWorkerFixtures {
  api: GistClient;
}

function hasAuthenticatedSession(): boolean {
  try {
    const state = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8')) as {
      cookies?: { name: string; domain: string }[];
    };
    return !!state.cookies?.some(
      (cookie) => cookie.name === 'user_session' && cookie.domain.includes('github.com'),
    );
  } catch {
    return false;
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export const test = base.extend<UiFixtures, UiWorkerFixtures>({
  authSession: [
    async ({}, use, testInfo) => {
      testInfo.skip(
        !hasAuthenticatedSession(),
        `No authenticated GitHub session in ${STORAGE_STATE_PATH}. ` +
          'Provide GH_UI_USER/GH_UI_PASSWORD/GH_UI_TOTP_SECRET (see .env.example).',
      );
      await use();
    },
    { auto: true },
  ],

  api: [
    async ({}, use) => {
      const context = await newApiContext(requireToken());
      await use(new GistClient(context));
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  gistFactory: async ({ api }, use) => {
    const factory = new GistFactory(api);
    await use(factory);
    await factory.cleanup();
  },

  createPage: async ({ page }, use) => {
    await use(new GistCreatePage(page));
  },

  editorForm: async ({ page }, use) => {
    await use(new GistEditorForm(page));
  },

  viewPage: async ({ page }, use) => {
    await use(new GistViewPage(page));
  },
});

export { expect } from '../assertions/expect';
