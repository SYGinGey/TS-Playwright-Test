import type { Locator, Page } from '@playwright/test';
import { expect } from '../../assertions/expect';

export class GistEditorForm {
  private readonly root: Locator;
  private readonly contentField: Locator;
  readonly descriptionInput: Locator;
  readonly filenameInput: Locator;
  readonly editor: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('form').filter({ has: page.locator('.CodeMirror') });
    this.descriptionInput = this.root.getByPlaceholder(/gist description/i);
    this.filenameInput = this.root.getByPlaceholder(/filename including extension/i).first();
    this.editor = this.root.locator('.CodeMirror').first();
    this.contentField = this.root.locator('textarea[name="gist[contents][][value]"]').first();
  }

  async fill(options: { description: string; filename: string; content: string }): Promise<void> {
    await this.descriptionInput.fill(options.description);
    await this.filenameInput.fill(options.filename);
    await this.typeContent(options.content);
  }

  async typeContent(content: string): Promise<void> {
    await expect(async () => {
      await this.clearContent();
      await this.page.keyboard.insertText(content);
      await expect(this.contentField).toHaveValue(content, { timeout: 2_000 });
    }).toPass({ timeout: 20_000 });
  }

  async clearContent(): Promise<void> {
    await this.editor.click();
    await expect(this.editor).toHaveClass(/CodeMirror-focused/, { timeout: 2_000 });
    await this.page.keyboard.press('ControlOrMeta+KeyA');
    await this.page.keyboard.press('Delete');
  }

  async createSecretGist(): Promise<void> {
    await this.root.getByRole('button', { name: /create secret gist/i }).click();
  }

  async updateGist(): Promise<void> {
    await this.root.getByRole('button', { name: /update.*gist/i }).click();
  }
}
