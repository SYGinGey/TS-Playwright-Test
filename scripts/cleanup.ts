import 'dotenv/config';
import {
  API_BASE_URL,
  GIST_DESCRIPTION_PREFIX,
  GITHUB_API_HEADERS,
  RUN_ID,
  TEST_GIST_PREFIX,
} from '../src/config/env';
import { tokenPool } from '../src/config/account-pool';
import type { Gist } from '../src/types/gist';

// Long enough that no gist this old can belong to a run still in flight: the CI
// jobs cap out at 20 minutes.
const ORPHAN_AFTER_MS = 2 * 60 * 60 * 1000;

/**
 * A run always sweeps its own gists. Another run's gists are only swept once
 * they are too old to belong to a run still going — that is what lets the api
 * and ui jobs share an account and still clean up in parallel without deleting
 * each other's live test data. With no RUN_ID (a local `npm run cleanup`) the
 * own-prefix check degenerates to the common prefix and takes everything.
 */
function shouldDelete(gist: Gist): boolean {
  const description = gist.description ?? '';
  if (!description.startsWith(TEST_GIST_PREFIX)) return false;
  if (description.startsWith(GIST_DESCRIPTION_PREFIX)) return true;
  return Date.now() - Date.parse(gist.created_at) > ORPHAN_AFTER_MS;
}

function headersFor(token: string): Record<string, string> {
  return {
    ...GITHUB_API_HEADERS,
    Authorization: `Bearer ${token}`,
  };
}

async function listAllGists(token: string): Promise<Gist[]> {
  const gists: Gist[] = [];
  for (let page = 1; ; page++) {
    const response = await fetch(`${API_BASE_URL}/gists?per_page=100&page=${page}`, {
      headers: headersFor(token),
    });
    if (!response.ok) {
      throw new Error(`Failed to list gists: ${response.status} ${await response.text()}`);
    }
    const batch = (await response.json()) as Gist[];
    gists.push(...batch);
    if (batch.length < 100) return gists;
  }
}

async function sweepAccount(label: string, token: string): Promise<void> {
  const stale = (await listAllGists(token)).filter(shouldDelete);

  if (stale.length === 0) {
    console.log(`[${label}] No leftover test gists found.`);
    return;
  }

  console.log(`[${label}] Deleting ${stale.length} leftover test gist(s)...`);
  for (const gist of stale) {
    const response = await fetch(`${API_BASE_URL}/gists/${gist.id}`, {
      method: 'DELETE',
      headers: headersFor(token),
    });
    console.log(`  ${gist.id} (${gist.description}) -> ${response.status}`);
  }
}

async function main(): Promise<void> {
  const pool = tokenPool();
  if (pool.length === 0) {
    throw new Error('GITHUB_TOKEN is not set — nothing to sweep (see .env.example).');
  }
  console.log(
    RUN_ID
      ? `Sweeping gists of run "${RUN_ID}", plus any orphan older than 2h.`
      : 'Sweeping every gist left behind by the suite (no GIST_RUN_ID set).',
  );
  for (const [index, token] of pool.entries()) {
    await sweepAccount(`account #${index + 1}`, token);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
