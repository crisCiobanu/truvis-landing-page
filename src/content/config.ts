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

/**
 * FAQ content collection schema — Story 5.1 (AR6, FR31)
 *
 * Data collection for FAQ entries displayed in the FAQ accordion.
 * Each entry is a JSON file under src/content/faq/.
 */
const faqSchema = z.object({
  id: z.string(),
  question: z.string().max(200, 'question must be ≤200 chars'),
  answer: z.string(),
  order: z.number(),
  featured: z.boolean().default(false),
  category: z.string().optional(),
});

/**
 * Testimonials content collection schema — Story 5.1 (AR6, FR32)
 *
 * Data collection for social-proof testimonials.
 * Post-launch entries require an authorImage.
 */
const testimonialSchema = z
  .object({
    id: z.string(),
    quote: z.string(),
    attribution: z.string(),
    context: z.string().optional(),
    phase: z.enum(['pre', 'post']).default('pre'),
    featured: z.boolean().default(false),
    authorImage: z
      .object({
        src: z.string(),
        alt: z.string(),
        width: z.number(),
        height: z.number(),
      })
      .optional(),
    rating: z.number().min(1).max(5).optional(),
  })
  .refine((d) => d.phase !== 'post' || d.authorImage !== undefined, {
    message: 'Post-launch testimonials require authorImage',
  });

/**
 * Stats content collection schema — Story 5.1 (AR6, FR33)
 *
 * Data collection for social-proof statistics.
 * Pre-launch entries require a source citation.
 */
const statsSchema = z
  .object({
    id: z.string(),
    value: z.string(),
    label: z.string(),
    source: z.string().min(1).optional(),
    category: z.enum(['teal', 'amber', 'coral']),
    phase: z.enum(['pre', 'post']).default('pre'),
    order: z.number(),
  })
  .refine((d) => d.phase !== 'pre' || d.source !== undefined, {
    message: 'Pre-launch stats require source citation',
  });

/**
 * Site content collection schema — Story 5.1 (AR6)
 *
 * Single-entry data collection holding editable global strings.
 * Accessed via getEntry('siteContent', 'landing').
 */
const siteContentSchema = z.object({
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    postLaunchHeadline: z.string().optional(),
    postLaunchSubheadline: z.string().optional(),
  }),
  problem: z.object({
    body: z.array(z.string()),
    stats: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
        source: z.string(),
      })
    ),
  }),
  footer: z.object({
    tagline: z.string(),
    smallPrint: z.string(),
  }),
  socialLinks: z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    tiktok: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
  }),
  appStoreUrls: z.object({
    ios: z.string().optional(),
    android: z.string().optional(),
  }),
  ctaLabels: z.object({
    preLaunchPrimary: z.string(),
    postLaunchPrimary: z.string(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: blogSchema,
});

const faq = defineCollection({
  type: 'data',
  schema: faqSchema,
});

const testimonials = defineCollection({
  type: 'data',
  schema: testimonialSchema,
});

const stats = defineCollection({
  type: 'data',
  schema: statsSchema,
});

const siteContent = defineCollection({
  type: 'data',
  schema: siteContentSchema,
});

export const collections = {
  blog,
  faq,
  testimonials,
  stats,
  siteContent,
};

export type BlogEntry = z.infer<typeof blogSchema>;
export type FaqEntry = z.infer<typeof faqSchema>;
export type TestimonialEntry = z.infer<typeof testimonialSchema>;
export type StatsEntry = z.infer<typeof statsSchema>;
export type SiteContentEntry = z.infer<typeof siteContentSchema>;
