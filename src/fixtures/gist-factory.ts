import { randomUUID } from 'node:crypto';
import { expect } from '../assertions/expect';
import type { GistClient } from '../api/gist-client';
import type { CreateGistPayload, Gist } from '../types/gist';
import { GIST_DESCRIPTION_PREFIX } from '../config/env';

export class GistFactory {
  private readonly createdIds: string[] = [];

  constructor(private readonly client: GistClient) {}

  payload(overrides: Partial<CreateGistPayload> = {}): CreateGistPayload {
    return {
      description: `${GIST_DESCRIPTION_PREFIX} ${randomUUID()}`,
      public: false,
      files: { 'notes.md': { content: 'Hello from the automated test suite.' } },
      ...overrides,
    };
  }

  async create(overrides: Partial<CreateGistPayload> = {}): Promise<Gist> {
    const response = await this.client.createGist(this.payload(overrides));
    await expect(response, 'test data setup: gist must be created').toHaveStatus(201);
    const gist = (await response.json()) as Gist;
    this.track(gist.id);
    return gist;
  }

  track(gistId: string): void {
    this.createdIds.push(gistId);
  }

  async cleanup(): Promise<void> {
    for (const id of this.createdIds) {
      try {
        await this.client.deleteGist(id);
      } catch {
        // Swept later by `npm run cleanup`.
      }
    }
    this.createdIds.length = 0;
  }
}
