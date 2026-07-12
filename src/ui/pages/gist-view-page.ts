import type { Locator, Page } from '@playwright/test';

export class GistViewPage {
  static readonly URL_PATTERN = /gist\.github\.com\/[^/]+\/([0-9a-f]+)/i;

  constructor(private readonly page: Page) {}

  async goto(htmlUrl: string): Promise<void> {
    await this.page.goto(htmlUrl);
  }

  gistIdFromUrl(): string {
    const match = this.page.url().match(GistViewPage.URL_PATTERN);
    if (!match) {
      throw new Error(`Cannot extract gist id from URL: ${this.page.url()}`);
    }
    return match[1]!;
  }

  fileHeader(filename: string): Locator {
    return this.page.getByRole('link', { name: filename }).first();
  }

  contentText(text: string): Locator {
    return this.page.getByText(text).first();
  }

  editButton(): Locator {
    return this.page.getByRole('link', { name: /^edit$/i }).first();
  }
}
