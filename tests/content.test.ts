import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { BlogPostViewSchema } from '../src/lib/types/blog';

const testDir = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(testDir, '..');
const distDir = resolve(rootDir, 'dist');

const SITE_URL = 'https://truvis.app';

// Schema for the categories endpoint
const CategoriesEntrySchema = z.object({
  category: z.string(),
  postCount: z.number().int().nonnegative(),
});

describe('Blog API contract tests', () => {
  beforeAll(() => {
    execSync('npx astro build', {
      cwd: rootDir,
      stdio: 'pipe',
      timeout: 120_000,
      env: { ...process.env, PUBLIC_SITE_URL: SITE_URL },
    });
  }, 180_000);

  describe('GET /api/v1/blog/posts.json', () => {
    let posts: unknown[];

    beforeAll(() => {
      const filePath = resolve(distDir, 'api/v1/blog/posts.json');
      expect(existsSync(filePath)).toBe(true);
      posts = JSON.parse(readFileSync(filePath, 'utf-8'));
    });

    it('is a raw array with no wrapper', () => {
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThan(0);
    });

    it('every post validates against BlogPostViewSchema', () => {
      for (const post of posts) {
        const result = BlogPostViewSchema.safeParse(post);
        expect(result.success).toBe(true);
      }
    });

    it('all webUrl values are absolute and match expected pattern', () => {
      for (const post of posts) {
        const p = post as { webUrl: string };
        expect(p.webUrl).toMatch(
          new RegExp(`^${SITE_URL}/blog/\\d{4}/\\d{2}/[a-z0-9-]+$`)
        );
      }
    });

    it('all dates are ISO 8601', () => {
      for (const post of posts) {
        const p = post as { publishedAt: string };
        expect(p.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      }
    });

    it('all image refs are objects with src/alt/width/height', () => {
      for (const post of posts) {
        const p = post as {
          featuredImage: { src: string; alt: string; width: number; height: number };
        };
        expect(typeof p.featuredImage).toBe('object');
        expect(p.featuredImage.src).toMatch(/^https?:\/\//);
        expect(typeof p.featuredImage.alt).toBe('string');
        expect(typeof p.featuredImage.width).toBe('number');
        expect(typeof p.featuredImage.height).toBe('number');
      }
    });

    it('all field names are camelCase (no snake_case)', () => {
      for (const post of posts) {
        const keys = Object.keys(post as Record<string, unknown>);
        for (const key of keys) {
          expect(key).not.toMatch(/_[a-z]/);
        }
      }
    });

    it('contains only BlogPostView fields (no leaked internals)', () => {
      // Keep in sync with BlogPostViewSchema in src/lib/types/blog.ts
      const expectedKeys = new Set([
        'slug',
        'title',
        'excerpt',
        'category',
        'publishedAt',
        'author',
        'readTime',
        'featured',
        'featuredImage',
        'webUrl',
        'seo',
        'relatedSlugs',
      ]);
      for (const post of posts) {
        const keys = Object.keys(post as Record<string, unknown>);
        const extraKeys = keys.filter((k) => !expectedKeys.has(k));
        expect(extraKeys).toEqual([]);
      }
    });
  });

  describe('GET /api/v1/blog/posts/[slug].json', () => {
    let slugFiles: string[];

    beforeAll(() => {
      const postsDir = resolve(distDir, 'api/v1/blog/posts');
      expect(existsSync(postsDir)).toBe(true);
      slugFiles = readdirSync(postsDir).filter((f) => f.endsWith('.json'));
    });

    it('generates a JSON file for each known slug', () => {
      expect(slugFiles.length).toBeGreaterThan(0);
    });

    it('each file validates against BlogPostViewSchema', () => {
      for (const file of slugFiles) {
        const filePath = resolve(distDir, 'api/v1/blog/posts', file);
        const data = JSON.parse(readFileSync(filePath, 'utf-8'));
        const result = BlogPostViewSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('GET /api/v1/blog/categories.json', () => {
    let categories: unknown[];

    beforeAll(() => {
      const filePath = resolve(distDir, 'api/v1/blog/categories.json');
      expect(existsSync(filePath)).toBe(true);
      categories = JSON.parse(readFileSync(filePath, 'utf-8'));
    });

    it('is a raw array with no wrapper', () => {
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('every entry validates against CategoriesEntrySchema', () => {
      for (const entry of categories) {
        const result = CategoriesEntrySchema.safeParse(entry);
        expect(result.success).toBe(true);
      }
    });

    it('postCount values are positive integers', () => {
      for (const entry of categories) {
        const e = entry as { postCount: number };
        expect(Number.isInteger(e.postCount)).toBe(true);
        expect(e.postCount).toBeGreaterThan(0);
      }
    });
  });

  describe('negative cases - schema rejects invalid shapes', () => {
    it('rejects a post with snake_case field names', () => {
      const bad = {
        slug: 'test',
        title: 'Test',
        excerpt: 'Test',
        category: 'buying-guide',
        published_at: '2026-01-01T00:00:00Z',
        author: 'A',
        read_time: '5 min',
        featured: false,
        featured_image: {
          src: 'https://x.com/img.jpg',
          alt: 'a',
          width: 1,
          height: 1,
        },
        web_url: 'https://x.com/blog/2026/01/test',
        seo: {},
        related_slugs: [],
      };
      expect(BlogPostViewSchema.safeParse(bad).success).toBe(false);
    });

    it('rejects a post with relative URL in webUrl', () => {
      const bad = {
        slug: 'test',
        title: 'Test',
        excerpt: 'Test',
        category: 'buying-guide',
        publishedAt: '2026-01-01T00:00:00Z',
        author: 'A',
        readTime: '5 min',
        featured: false,
        featuredImage: {
          src: 'https://x.com/img.jpg',
          alt: 'a',
          width: 1,
          height: 1,
        },
        webUrl: '/blog/2026/01/test',
        seo: {},
        relatedSlugs: [],
      };
      expect(BlogPostViewSchema.safeParse(bad).success).toBe(false);
    });

    it('rejects a post with bare string image instead of object', () => {
      const bad = {
        slug: 'test',
        title: 'Test',
        excerpt: 'Test',
        category: 'buying-guide',
        publishedAt: '2026-01-01T00:00:00Z',
        author: 'A',
        readTime: '5 min',
        featured: false,
        featuredImage: '/img.jpg',
        webUrl: 'https://x.com/blog/2026/01/test',
        seo: {},
        relatedSlugs: [],
      };
      expect(BlogPostViewSchema.safeParse(bad).success).toBe(false);
    });

    it('rejects a post with non-ISO date', () => {
      const bad = {
        slug: 'test',
        title: 'Test',
        excerpt: 'Test',
        category: 'buying-guide',
        publishedAt: 'March 15, 2026',
        author: 'A',
        readTime: '5 min',
        featured: false,
        featuredImage: {
          src: 'https://x.com/img.jpg',
          alt: 'a',
          width: 1,
          height: 1,
        },
        webUrl: 'https://x.com/blog/2026/01/test',
        seo: {},
        relatedSlugs: [],
      };
      expect(BlogPostViewSchema.safeParse(bad).success).toBe(false);
    });
  });
});
