import type { APIRoute } from 'astro';
import { getAllBlogPosts } from '@/lib/content';

export const GET: APIRoute = async () => {
  const posts = await getAllBlogPosts();
  const categoryMap = new Map<string, number>();

  for (const post of posts) {
    categoryMap.set(post.category, (categoryMap.get(post.category) || 0) + 1);
  }

  const categories = Array.from(categoryMap.entries())
    .map(([category, postCount]) => ({
      category,
      postCount,
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  return new Response(JSON.stringify(categories), {
    headers: { 'Content-Type': 'application/json' },
  });
};
