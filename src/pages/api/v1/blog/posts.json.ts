import type { APIRoute } from 'astro';
import { getAllBlogPosts } from '@/lib/content';

export const GET: APIRoute = async () => {
  const posts = await getAllBlogPosts();
  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' },
  });
};
