export default {
  async fetch(request, env) {
    const origin = String(env.ALBUM_ORIGIN_URL || '').replace(/\/+$/, '');
    const allowed = String(env.ALBUM_SITE_ORIGIN || 'https://martin830000-spec.github.io');
    const reqOrigin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(reqOrigin, allowed)
      });
    }
    if (!origin) return json({ ok: false, error: 'origin_not_configured' }, 503, reqOrigin, allowed);

    const src = new URL(request.url);
    const upstream = new URL(src.pathname + src.search, origin + '/');
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.set('X-Forwarded-Host', src.host);

    const init = {
      method: request.method,
      headers,
      redirect: 'manual'
    };
    if (!['GET', 'HEAD'].includes(request.method)) init.body = request.body;

    let res;
    try {
      res = await fetch(new Request(upstream.toString(), init));
    } catch (error) {
      return json({ ok: false, error: 'upstream_unavailable' }, 502, reqOrigin, allowed);
    }

    const out = new Headers(res.headers);
    for (const [k, v] of Object.entries(corsHeaders(reqOrigin, allowed))) out.set(k, v);
    return new Response(res.body, { status: res.status, headers: out });
  }
};

function corsHeaders(origin, allowed) {
  const ok = !origin || origin === allowed;
  return {
    'Access-Control-Allow-Origin': ok ? (origin || allowed) : allowed,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type, X-Album-Key, X-Album-Request-Id, Range',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Expose-Headers': 'Content-Type, Content-Length, Content-Range, X-File-Name'
  };
}

function json(value, status, origin, allowed) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(origin, allowed) }
  });
}
