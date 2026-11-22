import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../workers/photo-delivery/index.mjs';

const key = 'artists/12345678-1234-4123-8123-123456789012.jpg';
function fixture() {
  let reads = 0;
  const object = () => ({
    body: new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array([1, 2, 3])); controller.close(); } }),
    size: 3,
    httpEtag: '"abc123"',
    writeHttpMetadata(headers) { headers.set('Content-Type', 'image/jpeg'); },
  });
  const env = { PHOTOS: {
    async get(value) { reads++; return value === key ? object() : null; },
    async head(value) { reads++; if (value !== key) return null; const { body, ...metadata } = object(); await body.cancel(); return metadata; },
  } };
  return { env, reads: () => reads };
}
test('public delivery excludes staging, traversal, arbitrary files and write operations', async () => {
  const app = fixture();
  for (const path of ['_uploads/123', 'private/file.jpg', 'artists/photo.svg', `artists/%2e%2e%2f${key}`, '']) {
    assert.equal((await worker.fetch(new Request(`https://photos.test/${path}`), app.env)).status, 404);
  }
  for (const method of ['PUT', 'POST', 'DELETE']) {
    assert.equal((await worker.fetch(new Request(`https://photos.test/${key}`, { method }), app.env)).status, 405);
  }
  assert.equal(app.reads(), 0);
});
test('published images support GET, HEAD and conditional caching', async () => {
  const app = fixture();
  const get = await worker.fetch(new Request(`https://photos.test/${key}`), app.env);
  assert.equal(get.status, 200);
  assert.equal(get.headers.get('Content-Type'), 'image/jpeg');
  assert.equal(get.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal((await get.arrayBuffer()).byteLength, 3);
  const head = await worker.fetch(new Request(`https://photos.test/${key}`, { method: 'HEAD' }), app.env);
  assert.equal(head.status, 200);
  assert.equal(head.body, null);
  assert.equal(head.headers.get('Content-Length'), '3');
  const cached = await worker.fetch(new Request(`https://photos.test/${key}`, { headers: { 'If-None-Match': 'W/"abc123"' } }), app.env);
  assert.equal(cached.status, 304);
  assert.equal(cached.body, null);
});
