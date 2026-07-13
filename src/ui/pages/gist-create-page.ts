import type { Page } from '@playwright/test';
import { GistEditorForm } from '../components/gist-editor-form';
import { step } from '../step';

export class GistCreatePage {
  readonly editor: GistEditorForm;

  constructor(private readonly page: Page) {
    this.editor = new GistEditorForm(page);
  }

  @step('open the new gist page')
  async goto(): Promise<void> {
    await this.page.goto('/');
  }
}
