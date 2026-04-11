// Flat ESLint config — Truvis landing page
//
// ESLint 9 requires flat config (the legacy `.eslintrc.json` that
// shipped with the starter no longer works). This file is a minimal
// migration of the starter's intent: `eslint:recommended` + TypeScript
// recommended + Astro recommended, across .ts / .tsx / .astro files.
//
// Story 1.7 will expand this with project-specific custom rules
// (hydration policy enforcement, nanostore conventions, env-var access
// rules, etc.). Until then, keep this file lean — the only job today
// is to give the Story 1.2 CI gate a green baseline to run against.

import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astroPlugin from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  // Ignore build output, vendored tooling, and content that prettier
  // also ignores. Keep this in sync with .prettierignore where sensible.
  {
    ignores: [
      'dist/**',
      '.astro/**',
      '.lighthouseci/**',
      'node_modules/**',
      '_bmad/**',
      '_bmad-output/**',
      'lighthouse/baseline/**',
      'public/**',
      'coverage/**',
    ],
  },

  // Base JS recommended rules, applied to .js / .cjs / .mjs.
  js.configs.recommended,

  // Node.js scripts — one-off tooling under `scripts/` that runs with `node`.
  // Expose the Node globals so ESLint's `no-undef` rule stops flagging
  // `process`, `console`, `Buffer`, `fetch`, `URL`, etc.
  {
    files: ['scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'module',
    },
  },

  // TypeScript — both .ts and .tsx. Uses the recommended preset from
  // @typescript-eslint but turns off a few noisy rules that will be
  // re-enabled deliberately in Story 1.7.
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // TypeScript already checks for undefined identifiers and
      // redeclarations (and understands DOM globals, type/value merging,
      // etc.) — defer to the compiler and switch off the ESLint rules
      // that duplicate that work with false positives.
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-unused-vars': 'off',
      // The shadcn/ui primitives ship with empty interface declarations
      // (`interface Foo extends BarProps {}`) as extension points. Let
      // them through for now — Story 1.7 will decide the final policy.
      '@typescript-eslint/no-empty-object-type': 'off',
      // Unused-vars is noisy on starter code; keep it as a warning so
      // it shows up in editors but does not block CI until Story 1.7.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Astro components — .astro files. eslint-plugin-astro's flat preset
  // wires the parser and its recommended ruleset in one go.
  ...astroPlugin.configs['flat/recommended'],
];
