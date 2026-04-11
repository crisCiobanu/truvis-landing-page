/**
 * Unit tests for src/lib/env.ts — Story 1.7 (AC5, NFR12)
 *
 * We can't cleanly mutate `import.meta.env` at runtime in Vitest, so
 * these tests exercise the `process.env` fallback path. In practice
 * Astro surfaces env through both channels and our helper unions them.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getOptional, getRequired, parseBoolean } from './env';

describe('src/lib/env.ts', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear the subset of keys these tests use so one case can't leak
    // into another.
    delete process.env.TRUVIS_TEST_REQUIRED;
    delete process.env.TRUVIS_TEST_OPTIONAL;
    delete process.env.TRUVIS_TEST_BOOL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('getRequired', () => {
    it('returns the value when the key is set', () => {
      process.env.TRUVIS_TEST_REQUIRED = 'hello';
      expect(getRequired('TRUVIS_TEST_REQUIRED')).toBe('hello');
    });

    it('throws a descriptive error when the key is missing', () => {
      expect(() => getRequired('TRUVIS_TEST_REQUIRED')).toThrow(
        /TRUVIS_TEST_REQUIRED/
      );
    });

    it('throws when the key is set to an empty string', () => {
      process.env.TRUVIS_TEST_REQUIRED = '';
      expect(() => getRequired('TRUVIS_TEST_REQUIRED')).toThrow(
        /TRUVIS_TEST_REQUIRED/
      );
    });
  });

  describe('getOptional', () => {
    it('returns the value when set', () => {
      process.env.TRUVIS_TEST_OPTIONAL = 'yo';
      expect(getOptional('TRUVIS_TEST_OPTIONAL')).toBe('yo');
    });

    it('returns the fallback when missing', () => {
      expect(getOptional('TRUVIS_TEST_OPTIONAL', 'default')).toBe('default');
    });

    it('returns empty string when missing and no fallback is supplied', () => {
      expect(getOptional('TRUVIS_TEST_OPTIONAL')).toBe('');
    });
  });

  describe('parseBoolean', () => {
    it('returns true for "true"', () => {
      process.env.TRUVIS_TEST_BOOL = 'true';
      expect(parseBoolean('TRUVIS_TEST_BOOL')).toBe(true);
    });

    it('returns true for "TRUE" (case-insensitive)', () => {
      process.env.TRUVIS_TEST_BOOL = 'TRUE';
      expect(parseBoolean('TRUVIS_TEST_BOOL')).toBe(true);
    });

    it('returns true for "1"', () => {
      process.env.TRUVIS_TEST_BOOL = '1';
      expect(parseBoolean('TRUVIS_TEST_BOOL')).toBe(true);
    });

    it('returns false for "false"', () => {
      process.env.TRUVIS_TEST_BOOL = 'false';
      expect(parseBoolean('TRUVIS_TEST_BOOL')).toBe(false);
    });

    it('returns false when unset', () => {
      expect(parseBoolean('TRUVIS_TEST_BOOL')).toBe(false);
    });

    it('returns false for non-boolean garbage', () => {
      process.env.TRUVIS_TEST_BOOL = 'banana';
      expect(parseBoolean('TRUVIS_TEST_BOOL')).toBe(false);
    });
  });
});
