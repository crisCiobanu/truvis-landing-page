import type { APIRoute, GetStaticPaths } from 'astro';
import { getAllBlogPosts, getBlogPost } from '@/lib/content';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
};

export const GET: APIRoute = async ({ params }) => {
  const post = await getBlogPost(params.slug!);
  if (!post) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify(post), {
    headers: { 'Content-Type': 'application/json' },
  });
};
