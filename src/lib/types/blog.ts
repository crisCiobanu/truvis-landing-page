/**
 * Blog cross-platform types — Story 4.1 (AR9, NFR31)
 *
 * BlogPostView is the ONLY type downstream consumers import.
 * Never import the raw Zod-inferred type from config.ts.
 */

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
