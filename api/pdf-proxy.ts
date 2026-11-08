export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing "url" parameter', { status: 400 });
  }

  // Security: only allow fetching from Firebase Storage domain
  try {
    const parsed = new URL(targetUrl);
    if (
      !parsed.hostname.endsWith('firebasestorage.googleapis.com') &&
      !parsed.hostname.endsWith('storage.googleapis.com')
    ) {
      return new Response('Forbidden domain', { status: 403 });
    }
  } catch {
    return new Response('Invalid URL', { status: 400 });
  }

  try {
    const upstream = await fetch(targetUrl);
    if (!upstream.ok) {
      return new Response(`Upstream storage error: ${upstream.statusText}`, {
        status: upstream.status,
      });
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return new Response(err?.message || 'Proxy error', { status: 500 });
  }
}
