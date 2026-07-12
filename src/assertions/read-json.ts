import type { APIResponse } from '@playwright/test';
import { expect } from './expect';

export async function readJson<T>(response: APIResponse, status = 200): Promise<T> {
  await expect(response).toHaveStatus(status);
  return (await response.json()) as T;
}
