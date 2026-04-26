import { defineCollection, z } from 'astro:content';

/**
 * Truvis blog content collection schema — Story 4.1 (AR6, FR18–FR26)
 *
 * This is the single source of truth for blog entry validation.
 * Zod runs at build time: any missing required field fails the build.
 */
const blogSchema = z.object({
  // Note: `slug` is provided in front matter but Astro 5 strips it from
  // `data` and surfaces it as `entry.slug` / `entry.id`. We validate it
  // optionally here so it can coexist in front matter without breaking Zod.
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case')
    .optional(),
  title: z.string().max(70, 'title must be ≤70 chars for SEO'),
  excerpt: z.string().max(200, 'excerpt must be ≤200 chars'),
  category: z.enum([
    'buying-guide',
    'inspection-tips',
    'case-study',
    'deep-dive',
  ]),
  publishDate: z.date(),
  author: z.string(),
  readTime: z.string(),
  featured: z.boolean().default(false),
  featuredImage: z.object({
    src: z.string().min(1, 'src is required'),
    alt: z.string().min(1, 'alt text is required'),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    socialImage: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }),
  relatedSlugs: z.array(z.string()).default([]),
});

const blog = defineCollection({
  type: 'content',
  schema: blogSchema,
});

export const collections = {
  blog,
};

export type BlogEntry = z.infer<typeof blogSchema>;
