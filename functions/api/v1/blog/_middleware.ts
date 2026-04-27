// Cloudflare Pages Functions middleware that adds explicit CDN cache headers
// to all /api/v1/blog/* responses. This ensures the static JSON endpoints
// are cached aggressively at the Cloudflare edge (AR9).
//
// Cache policy:
//   max-age=300        -> browser/mobile-app caches for 5 minutes
//   s-maxage=86400     -> CDN edge caches for 24 hours
//   stale-while-revalidate=604800 -> serve stale for up to 7 days while revalidating
//
// The body is passed through unchanged -- this middleware is headers-only.

export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();
  response.headers.set(
    'Cache-Control',
    'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800'
  );
  return response;
};
