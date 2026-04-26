/**
 * Content Collection access boundary — Story 4.1 (AR25)
 *
 * This is the ONLY file in the repo allowed to call `getCollection()`.
 * Every other consumer MUST use the typed helpers exported here.
 * Raw Astro `CollectionEntry` objects never leak out — the return type
 * is always `BlogPostView`.
 */

import { getCollection, type CollectionEntry } from 'astro:content';

import { getOptional } from '@/lib/env';
import type { BlogCategory, BlogPostView } from '@/lib/types/blog';

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
