/**
 * Content Collection access boundary — Story 4.1 (AR25)
 *
 * This is the ONLY file in the repo allowed to call `getCollection()`.
 * Every other consumer MUST use the typed helpers exported here.
 * Raw Astro `CollectionEntry` objects never leak out — the return type
 * is always `BlogPostView`.
 */

import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

import { getOptional } from '@/lib/env';
import type { BlogCategory, BlogPostView } from '@/lib/types/blog';

// ── View types for non-blog collections (Story 5.1) ─────────────

export interface FaqEntryView {
  id: string;
  question: string;
  answer: string;
  order: number;
  featured: boolean;
  category?: string;
}

export interface TestimonialView {
  id: string;
  quote: string;
  attribution: string;
  context?: string;
  phase: 'pre' | 'post';
  featured: boolean;
  authorImage?: { src: string; alt: string; width: number; height: number };
  rating?: number;
}

export interface StatView {
  id: string;
  value: string;
  label: string;
  source?: string;
  category: 'teal' | 'amber' | 'coral';
  phase: 'pre' | 'post';
  order: number;
}

export interface SiteContentView {
  hero: {
    headline: string;
    subheadline: string;
    postLaunchHeadline?: string;
    postLaunchSubheadline?: string;
  };
  problem: {
    body: string[];
    stats: { label: string; value: string; source: string }[];
  };
  footer: { tagline: string; smallPrint: string };
  socialLinks: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  appStoreUrls: { ios?: string; android?: string };
  ctaLabels: { preLaunchPrimary: string; postLaunchPrimary: string };
}

/**
 * Transform a raw Astro blog entry into the public BlogPostView shape.
 *
 * Pure function — safe to unit-test with synthetic entry objects.
 */
export function buildBlogEntryView(
  entry: CollectionEntry<'blog'>
): BlogPostView {
  const siteUrl = getOptional(
    'PUBLIC_SITE_URL',
    'http://localhost:4321'
  ).replace(/\/$/, '');

  // Astro 5 strips `slug` from data and surfaces it as entry.slug/entry.id.
  // Prefer front-matter slug if present; fall back to entry.id with date
  // prefix and file extension stripped.
  const slug =
    entry.data.slug ??
    entry.id.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.(mdx?|md)$/, '');

  const date = entry.data.publishDate;
  const year = date.getUTCFullYear().toString();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');

  const rawSrc = entry.data.featuredImage.src;
  const absoluteSrc = rawSrc.startsWith('/') ? `${siteUrl}${rawSrc}` : rawSrc;

  const seo: BlogPostView['seo'] = {};
  if (entry.data.seo.title !== undefined) seo.title = entry.data.seo.title;
  if (entry.data.seo.description !== undefined)
    seo.description = entry.data.seo.description;
  if (entry.data.seo.socialImage !== undefined)
    seo.socialImage = entry.data.seo.socialImage;
  if (entry.data.seo.keywords !== undefined)
    seo.keywords = entry.data.seo.keywords;

  return {
    slug,
    title: entry.data.title,
    excerpt: entry.data.excerpt,
    category: entry.data.category,
    publishedAt: date.toISOString(),
    author: entry.data.author,
    readTime: entry.data.readTime,
    featured: entry.data.featured,
    featuredImage: {
      src: absoluteSrc,
      alt: entry.data.featuredImage.alt,
      width: entry.data.featuredImage.width,
      height: entry.data.featuredImage.height,
    },
    webUrl: `${siteUrl}/blog/${year}/${month}/${slug}`,
    seo,
    relatedSlugs: entry.data.relatedSlugs,
  };
}

/** All published blog posts, sorted by publishDate descending. */
export async function getAllBlogPosts(): Promise<BlogPostView[]> {
  const entries = await getCollection('blog');
  return entries
    .map(buildBlogEntryView)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

/**
 * All blog posts with their raw Astro entries (for `entry.render()`).
 * Sorted by publishDate descending.
 *
 * This is the only way page routes should obtain renderable entries —
 * they must NEVER call `getCollection('blog')` directly (AR25).
 */
export async function getAllBlogPostsWithEntries(): Promise<
  { post: BlogPostView; entry: CollectionEntry<'blog'> }[]
> {
  const entries = await getCollection('blog');
  return entries
    .map((entry) => ({ post: buildBlogEntryView(entry), entry }))
    .sort(
      (a, b) =>
        new Date(b.post.publishedAt).getTime() -
        new Date(a.post.publishedAt).getTime()
    );
}

/** Single blog post by slug, or null if not found. */
export async function getBlogPost(slug: string): Promise<BlogPostView | null> {
  const posts = await getAllBlogPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

/** Blog posts filtered by category, sorted by publishDate descending. */
export async function getBlogPostsByCategory(
  category: BlogCategory
): Promise<BlogPostView[]> {
  const posts = await getAllBlogPosts();
  return posts.filter((p) => p.category === category);
}

/** Featured blog posts, sorted by publishDate descending. */
export async function getFeaturedBlogPosts(
  limit = 10
): Promise<BlogPostView[]> {
  const posts = await getAllBlogPosts();
  return posts.filter((p) => p.featured).slice(0, limit);
}

/**
 * Related posts for a given slug.
 * Uses relatedSlugs if present; falls back to same-category posts.
 */
export async function getRelatedBlogPosts(
  slug: string,
  limit = 3
): Promise<BlogPostView[]> {
  const posts = await getAllBlogPosts();
  const current = posts.find((p) => p.slug === slug);
  if (!current) return [];

  if (current.relatedSlugs.length > 0) {
    const related = current.relatedSlugs
      .map((rs) => posts.find((p) => p.slug === rs))
      .filter((p): p is BlogPostView => p !== undefined);
    return related.slice(0, limit);
  }

  return posts
    .filter((p) => p.category === current.category && p.slug !== slug)
    .slice(0, limit);
}

// ── FAQ helpers (Story 5.1, FR31) ───────────────────────────────

function buildFaqEntryView(entry: CollectionEntry<'faq'>): FaqEntryView {
  return {
    id: entry.data.id,
    question: entry.data.question,
    answer: entry.data.answer,
    order: entry.data.order,
    featured: entry.data.featured,
    category: entry.data.category,
  };
}

/** All FAQ entries, sorted by `order` then `id`. */
export async function getFaqEntries(): Promise<FaqEntryView[]> {
  const entries = await getCollection('faq');
  return entries.map(buildFaqEntryView).sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.id.localeCompare(b.id);
  });
}

/** Featured FAQ entries, optionally limited. */
export async function getFeaturedFaqEntries(
  limit?: number
): Promise<FaqEntryView[]> {
  const all = await getFaqEntries();
  const featured = all.filter((e) => e.featured);
  return limit !== undefined ? featured.slice(0, limit) : featured;
}

// ── Testimonial helpers (Story 5.1, FR32) ───────────────────────

function buildTestimonialView(
  entry: CollectionEntry<'testimonials'>
): TestimonialView {
  return {
    id: entry.data.id,
    quote: entry.data.quote,
    attribution: entry.data.attribution,
    context: entry.data.context,
    phase: entry.data.phase,
    featured: entry.data.featured,
    authorImage: entry.data.authorImage,
    rating: entry.data.rating,
  };
}

/**
 * Testimonials filtered by phase.
 * Defaults to 'pre' until Story 5.3 ships lib/launch-phase.ts.
 */
// TODO(epic-5-phase): default to isPostLaunch() once Story 5.3 ships
export async function getTestimonials(
  phase: 'pre' | 'post' = 'pre'
): Promise<TestimonialView[]> {
  const entries = await getCollection('testimonials');
  return entries.map(buildTestimonialView).filter((t) => t.phase === phase);
}

// ── Stats helpers (Story 5.1, FR33) ─────────────────────────────

function buildStatView(entry: CollectionEntry<'stats'>): StatView {
  return {
    id: entry.data.id,
    value: entry.data.value,
    label: entry.data.label,
    source: entry.data.source,
    category: entry.data.category,
    phase: entry.data.phase,
    order: entry.data.order,
  };
}

/**
 * Stats filtered by phase, sorted by `order`.
 * Defaults to 'pre' until Story 5.3 ships lib/launch-phase.ts.
 */
// TODO(epic-5-phase): default to isPostLaunch() once Story 5.3 ships
export async function getStats(
  phase: 'pre' | 'post' = 'pre'
): Promise<StatView[]> {
  const entries = await getCollection('stats');
  return entries
    .map(buildStatView)
    .filter((s) => s.phase === phase)
    .sort((a, b) => a.order - b.order);
}

// ── Site content helper (Story 5.1) ─────────────────────────────

function buildSiteContentView(data: {
  hero: SiteContentView['hero'];
  problem: SiteContentView['problem'];
  footer: SiteContentView['footer'];
  socialLinks: SiteContentView['socialLinks'];
  appStoreUrls: SiteContentView['appStoreUrls'];
  ctaLabels: SiteContentView['ctaLabels'];
}): SiteContentView {
  return {
    hero: data.hero,
    problem: data.problem,
    footer: data.footer,
    socialLinks: data.socialLinks,
    appStoreUrls: data.appStoreUrls,
    ctaLabels: data.ctaLabels,
  };
}

/** Global site content from the single `siteContent/landing` entry. */
export async function getSiteContent(): Promise<SiteContentView> {
  const entry = await getEntry('siteContent', 'landing');
  if (!entry) {
    throw new Error(
      'Missing siteContent/landing entry — seed src/content/siteContent/landing.json'
    );
  }
  return buildSiteContentView(entry.data);
}
