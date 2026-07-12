export function tokenPool(): string[] {
  const pool: string[] = [];
  if (process.env.GITHUB_TOKEN) pool.push(process.env.GITHUB_TOKEN);

  for (let i = 2; ; i++) {
    const token = process.env[`GITHUB_TOKEN_${i}`];
    if (!token) break;
    pool.push(token);
  }
  return pool;
}

export function tokenForWorker(parallelIndex: number): string {
  const pool = tokenPool();
  if (pool.length === 0) {
    throw new Error(
      'GITHUB_TOKEN environment variable is not set. ' +
        'Create a token with the "gist" scope and put it into .env (see .env.example).',
    );
  }
  return pool[parallelIndex % pool.length]!;
}

export function otherTokenForWorker(parallelIndex: number): string | undefined {
  const pool = tokenPool();
  if (pool.length < 2) return undefined;
  return pool[(parallelIndex + 1) % pool.length]!;
}
