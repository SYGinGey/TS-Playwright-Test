import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  {
    ignores: [
      'node_modules',
      'playwright-report',
      'test-results',
      'allure-results',
      'allure-report',
      '.auth',
    ],
  },

  // Type-aware base: enables rules that need the type checker, most notably
  // no-floating-promises — a forgotten `await` in a Playwright test passes
  // silently without it.
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // The config file itself is not part of the TS project.
  {
    files: ['**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },

  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // console output belongs to CLI scripts; tests and fixtures have
      // richer channels (test.step, expect messages, attachments).
      'no-console': 'error',
    },
  },

  // Playwright best practices for test code (no waitForTimeout, no .only,
  // proper async matchers, etc.).
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**'],
  },

  // Scripts talk to humans via stdout — that is their interface.
  {
    files: ['scripts/**'],
    rules: { 'no-console': 'off' },
  },
  // The auth setup is a workflow, not a test: it warns on the skipped-login
  // path (keep that visible in run output) and branches by design
  // (reuse session / log in / give up).
  {
    files: ['tests/ui/auth.setup.ts'],
    rules: {
      'no-console': 'off',
      'playwright/no-conditional-in-test': 'off',
    },
  },

  // API and UI fixture stacks must not cross: ui-fixtures carries an
  // auto-skip on missing browser session that would silently disable an
  // API test, and their `api` fixtures differ (account pool vs account #1).
  {
    files: ['tests/api/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/ui-fixtures'],
              message: 'API tests must import from api-fixtures.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['tests/ui/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/api-fixtures'],
              message: 'UI tests must import from ui-fixtures.',
            },
          ],
        },
      ],
    },
  },
);
