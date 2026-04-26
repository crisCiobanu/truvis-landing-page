import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

import { getAllBlogPosts } from '@/lib/content';

export async function GET(context: APIContext) {
  const posts = await getAllBlogPosts();

  return rss({
    title: 'Truvis Blog',
    description:
      'Used-car inspection tips, buying guides, and case studies from Truvis.',
    site: context.site || 'https://truvis.app',
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt,
      pubDate: new Date(post.publishedAt),
      link: post.webUrl,
      author: post.author,
      categories: [post.category],
    })),
    customData: `<language>en</language>`,
  });
}
