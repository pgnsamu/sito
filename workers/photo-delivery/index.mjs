// Public photo delivery without a custom domain. Uploads remain authenticated
// through Supabase; staging files and all other bucket contents stay private.
const photoKey = /^(artists|works)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    const key = new URL(request.url).pathname.slice(1);
    if (!photoKey.test(key)) return new Response("Not found", { status: 404 });
    const object = request.method === "HEAD" ? await env.PHOTOS.head(key) : await env.PHOTOS.get(key);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("ETag", object.httpEtag);
    headers.set("Content-Length", String(object.size));
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Access-Control-Allow-Origin", "*");
    const etags = request.headers.get("If-None-Match")?.split(",").map(value => value.trim().replace(/^W\//, ""));
    if (etags?.includes(object.httpEtag) || etags?.includes("*")) {
      if ("body" in object) await object.body.cancel();
      headers.delete("Content-Length");
      return new Response(null, { status: 304, headers });
    }
    return new Response(request.method === "HEAD" ? null : object.body, { headers });
  },
};
