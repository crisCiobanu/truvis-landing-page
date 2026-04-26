/**
 * Blog cross-platform types — Story 4.1 (AR9, NFR31)
 *
 * BlogPostView is the ONLY type downstream consumers import.
 * Never import the raw Zod-inferred type from config.ts.
 */

import { z } from 'zod';

/**
 * Runtime Zod schema for BlogPostView — Story 4.8 (AR10)
 *
 * Used by the contract test (`tests/content.test.ts`) to validate
 * the static JSON API output at build time. Must stay in sync with
 * the BlogPostView TypeScript interface below.
 */
export const BlogPostViewSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  category: z.string(),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T/, 'must be ISO 8601'),
  author: z.string(),
  readTime: z.string(),
  featured: z.boolean(),
  featuredImage: z.object({
    src: z.string().url({ message: 'must be absolute URL' }),
    alt: z.string(),
    width: z.number(),
    height: z.number(),
  }),
  webUrl: z.string().url({ message: 'must be absolute URL' }),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    socialImage: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }),
  relatedSlugs: z.array(z.string()),
});

export type BlogCategory =
  | 'buying-guide'
  | 'inspection-tips'
  | 'case-study'
  | 'deep-dive';

export interface BlogPostView {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  /** ISO 8601 with timezone, e.g. "2026-04-10T14:30:00.000Z" */
  publishedAt: string;
  author: string;
  readTime: string;
  featured: boolean;
  featuredImage: {
    /** Absolute URL */
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  /** Absolute URL: ${PUBLIC_SITE_URL}/blog/${year}/${month}/${slug} */
  webUrl: string;
  seo: {
    title?: string;
    description?: string;
    socialImage?: string;
    keywords?: string[];
  };
  relatedSlugs: string[];
}
