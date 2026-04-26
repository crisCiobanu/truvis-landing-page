/**
 * Unit tests for buildBlogEntryView() — Story 4.1 (AR25, AC7)
 *
 * Tests the pure transformation function with synthetic entry objects.
 * Does NOT call getCollection() — that requires the Astro build pipeline.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock astro:content — only needed to satisfy the import; tests never call getCollection.
vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

import { buildBlogEntryView } from './content';

function makeMockEntry(overrides: Record<string, unknown> = {}) {
  const data = {
    slug: '7-things-to-check-before-buying-a-10-year-old-diesel',
    title: '7 Things to Check Before Buying a 10-Year-Old Diesel',
    excerpt: 'A pre-purchase checklist for older diesel vehicles.',
    category: 'buying-guide' as const,
    publishDate: new Date('2026-03-15T00:00:00Z'),
    author: 'Cristian Ciobanu',
    readTime: '6 min',
    featured: true,
    featuredImage: {
      src: '/assets/blog/placeholder-buying-guide.svg',
      alt: 'A mechanic inspecting a diesel engine bay',
      width: 1200,
      height: 630,
    },
    seo: {},
    relatedSlugs: [],
    ...overrides,
  };

  return {
    id: '2026-03-15-7-things-to-check-before-buying-a-10-year-old-diesel.mdx',
    slug: '2026-03-15-7-things-to-check-before-buying-a-10-year-old-diesel',
    body: '... markdown content ...',
    collection: 'blog' as const,
    data,
    render: async () => ({
      Content: () => null,
      headings: [],
      remarkPluginFrontmatter: {},
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe('buildBlogEntryView', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.PUBLIC_SITE_URL = 'https://truvis.app';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('computes webUrl from publishDate year/month and slug', () => {
    const result = buildBlogEntryView(makeMockEntry());
    expect(result.webUrl).toBe(
      'https://truvis.app/blog/2026/03/7-things-to-check-before-buying-a-10-year-old-diesel'
    );
  });

  it('zero-pads single-digit months in webUrl', () => {
    const result = buildBlogEntryView(
      makeMockEntry({ publishDate: new Date('2026-01-05T00:00:00Z') })
    );
    expect(result.webUrl).toContain('/blog/2026/01/');
  });

  it('handles double-digit months in webUrl', () => {
    const result = buildBlogEntryView(
      makeMockEntry({ publishDate: new Date('2026-11-20T00:00:00Z') })
    );
    expect(result.webUrl).toContain('/blog/2026/11/');
  });

  it('returns publishedAt as a valid ISO 8601 string', () => {
    const result = buildBlogEntryView(makeMockEntry());
    expect(result.publishedAt).toBe('2026-03-15T00:00:00.000Z');
    // Verify it's parseable back to a Date
    expect(new Date(result.publishedAt).toISOString()).toBe(result.publishedAt);
  });

  it('makes featuredImage.src absolute when it starts with /', () => {
    const result = buildBlogEntryView(makeMockEntry());
    expect(result.featuredImage.src).toBe(
      'https://truvis.app/assets/blog/placeholder-buying-guide.svg'
    );
  });

  it('passes through featuredImage.src unchanged when already absolute', () => {
    const result = buildBlogEntryView(
      makeMockEntry({
        featuredImage: {
          src: 'https://cdn.example.com/image.jpg',
          alt: 'External image',
          width: 800,
          height: 400,
        },
      })
    );
    expect(result.featuredImage.src).toBe('https://cdn.example.com/image.jpg');
  });

  it('includes all required fields in the output', () => {
    const result = buildBlogEntryView(makeMockEntry());
    expect(result).toHaveProperty('slug');
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('excerpt');
    expect(result).toHaveProperty('category');
    expect(result).toHaveProperty('publishedAt');
    expect(result).toHaveProperty('author');
    expect(result).toHaveProperty('readTime');
    expect(result).toHaveProperty('featured');
    expect(result).toHaveProperty('featuredImage');
    expect(result).toHaveProperty('webUrl');
    expect(result).toHaveProperty('seo');
    expect(result).toHaveProperty('relatedSlugs');
  });

  it('maps field values correctly from entry data', () => {
    const result = buildBlogEntryView(makeMockEntry());
    expect(result.slug).toBe(
      '7-things-to-check-before-buying-a-10-year-old-diesel'
    );
    expect(result.title).toBe(
      '7 Things to Check Before Buying a 10-Year-Old Diesel'
    );
    expect(result.category).toBe('buying-guide');
    expect(result.author).toBe('Cristian Ciobanu');
    expect(result.readTime).toBe('6 min');
    expect(result.featured).toBe(true);
    expect(result.featuredImage.alt).toBe(
      'A mechanic inspecting a diesel engine bay'
    );
    expect(result.featuredImage.width).toBe(1200);
    expect(result.featuredImage.height).toBe(630);
  });

  it('omits undefined seo fields instead of setting them to null', () => {
    const result = buildBlogEntryView(makeMockEntry({ seo: {} }));
    expect(result.seo).toEqual({});
    expect('title' in result.seo).toBe(false);
    expect('description' in result.seo).toBe(false);
    expect('socialImage' in result.seo).toBe(false);
    expect('keywords' in result.seo).toBe(false);
  });

  it('includes seo fields that are provided', () => {
    const result = buildBlogEntryView(
      makeMockEntry({
        seo: {
          title: 'Custom SEO Title',
          description: 'Custom description',
          keywords: ['diesel', 'inspection'],
        },
      })
    );
    expect(result.seo.title).toBe('Custom SEO Title');
    expect(result.seo.description).toBe('Custom description');
    expect(result.seo.keywords).toEqual(['diesel', 'inspection']);
    expect('socialImage' in result.seo).toBe(false);
  });

  it('uses localhost fallback when PUBLIC_SITE_URL is not set', () => {
    delete process.env.PUBLIC_SITE_URL;
    const result = buildBlogEntryView(makeMockEntry());
    expect(result.webUrl).toMatch(/^http:\/\/localhost:4321\/blog\//);
    expect(result.featuredImage.src).toMatch(/^http:\/\/localhost:4321\//);
  });

  it('strips trailing slash from PUBLIC_SITE_URL', () => {
    process.env.PUBLIC_SITE_URL = 'https://truvis.app/';
    const result = buildBlogEntryView(makeMockEntry());
    expect(result.webUrl).not.toContain('truvis.app//');
  });
});
