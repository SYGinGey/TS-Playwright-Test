# GitHub Gist Test Automation

[![API and UI tests](https://github.com/revizto/Sergey-Yarygin-Technical-Assignments-Web/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/revizto/Sergey-Yarygin-Technical-Assignments-Web/actions/workflows/tests.yml)

Test automation solution for [GitHub Gist](https://gist.github.com/): REST API tests plus a small set of UI smoke tests, built with **TypeScript + Playwright**.

- The original assignment: [docs/ASSIGNMENT.md](docs/ASSIGNMENT.md)

## Project layout

```
├── src/
│   ├── api/gist-client.ts        # endpoint-per-method wrapper over the Gist REST API
│   ├── assertions/
│   │   ├── expect.ts             # custom matchers: toHaveStatus, toHaveFile
│   │   └── gist-assertions.ts    # asserts a gist matches the payload it was created from
│   ├── config/env.ts             # environment variables and shared constants
│   ├── fixtures/
│   │   ├── api-fixtures.ts       # authenticated/anonymous clients as Playwright fixtures
│   │   ├── ui-fixtures.ts        # page objects + API client for UI tests
│   │   └── gist-factory.ts       # creates test gists, guarantees cleanup
│   ├── types/gist.ts             # request/response typings
│   └── ui/
│       ├── pages/                # page objects (create, view)
│       └── components/           # reusable page components (gist editor form)
├── tests/
│   ├── api/                      # create, read, update, delete, star, list, negative
│   └── ui/                       # create via UI, edit via UI, API data in UI
├── scripts/
│   └── cleanup.ts                # sweeps leftover test gists
└── .github/workflows/tests.yml   # CI: lint + typecheck + API and UI tests
```

## Prerequisites

- Node.js 20+
- A GitHub account and a personal access token:
  - **classic PAT** with the `gist` scope, or
  - **fine-grained PAT** with the *Gists* account permission (read and write).

> Use a dedicated test account if possible: the suite creates and deletes real gists.

## Setup

```bash
npm install
cp .env.example .env       # then put your token into .env
```

Required environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `GITHUB_TOKEN` | PAT of account #1 — used by API tests, UI data setup, and cleanup |
| `GITHUB_TOKEN_2`, `GITHUB_TOKEN_3`, … | Optional account pool: gist-scoped PATs of extra accounts (numbered, no gaps). Each account adds parallel capacity, and ≥2 accounts enable cross-account tests (real forks, foreign-gist permissions) |
| `GIST_API_URL` | Optional API base URL override (defaults to `https://api.github.com`). Deliberately not named `GITHUB_API_URL` — Actions injects that one into every step itself |

Rate limits are per GitHub account, so API-test parallelism scales with the pool: workers are sharded across accounts round-robin at 4 workers per account (the measured safe concurrency). The UI project always uses account #1 — its saved browser session belongs to that account.

## Running the tests

```bash
npm test                 # API tests (default)
npm run test:ui          # UI tests (see authentication below)
npm run test:ui:debug    # UI tests with Playwright Inspector (headed, step-through)
npm run test:ui:headed   # UI tests in a visible browser
npm run test:all         # API, then UI
```

For interactive debugging with time travel, use `npx playwright test --ui`.

### Reports

Every run produces both a Playwright HTML report and Allure results:

```bash
npm run report              # open the Playwright HTML report
npm run report:allure       # generate the Allure report from allure-results/
npm run report:allure:open  # open the generated Allure report
```

> Allure report generation requires Java (any modern JRE); the Allure CLI ships with the project as a dev dependency.

### UI tests: authentication

UI tests need a logged-in GitHub session (stored in `.auth/user.json`, gitignored). The `ui-setup` project resolves it automatically before every UI run — locally and in CI alike:

1. **A valid saved session exists** → reused as is.
2. **`GH_UI_USER` / `GH_UI_PASSWORD` / `GH_UI_TOTP_SECRET` are set** → performs a real login, generating the 2FA code from the TOTP secret, and saves the session for subsequent runs.
3. **Neither** → UI tests are skipped with an explanatory message rather than failing.

The account must be a dedicated test (machine) account with TOTP-based 2FA; `GH_UI_TOTP_SECRET` is the base32 setup key GitHub shows when configuring the authenticator app. Put the three variables into `.env` locally or into repository secrets for CI.

### Test data and cleanup

Every gist created by the suite has a description starting with `[gist-e2e]`. Fixtures delete their data after each test; if a run is interrupted, sweep the leftovers with:

```bash
npm run cleanup
```

## CI

`.github/workflows/tests.yml` runs two jobs on every push/PR:

- **api-tests**: lint, typecheck, and the API project.
- **ui-tests**: the UI project, in parallel with api-tests. Runs only when the `GH_UI_*` secrets are configured; otherwise it's a no-op.

Both jobs work on account #1 at the same time, so each tags the gists it creates with its own `GIST_RUN_ID` (`<run id>-<job>`; the run id alone is shared by both jobs) and its post-run sweep removes only those. Gists of *another* run are left alone until they are older than two hours — long past the job timeouts, so a sweep can never take data out from under a run still going. Without `GIST_RUN_ID` — a local `npm run cleanup` — the sweep takes everything the suite ever left behind.

Configuration notes:

- Add a repository secret **`GIST_TOKEN`** containing the PAT (the name `GITHUB_TOKEN` is reserved by Actions). Optionally add **`GIST_TOKEN_2`** (second account) to enable cross-account tests in CI.
- For UI in CI, use a **dedicated machine account** with TOTP 2FA and add its **`GH_UI_USER`**, **`GH_UI_PASSWORD`**, and **`GH_UI_TOTP_SECRET`** (the base32 authenticator setup key) as secrets. Caveat: GitHub may still challenge logins from fresh runner IPs (device verification / captcha) — if that becomes flaky, a self-hosted runner with a stable IP is the fix.
- **`GH_UI_*` must be the same account as `GIST_TOKEN`.** The UI tests set their data up through the API (account #1) and then edit it in the browser — a session belonging to any other account sees those gists as somebody else's, with no *Edit* button, and the test dies waiting for it. The same holds locally between `.env` and the saved session in `.auth/`.
- A pull request from a fork gets no secrets, so both jobs gate on theirs: lint and typecheck still run, everything needing an account is skipped rather than failing on a missing token.
- Allure and Playwright HTML reports are uploaded as build artifacts; leftover test data is swept even when tests fail.

## Quality gates

```bash
npm run lint
npm run typecheck
```
