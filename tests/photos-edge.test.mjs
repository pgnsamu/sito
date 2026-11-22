import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import ts from 'typescript';
import { webcrypto } from 'node:crypto';

const source = ['_shared/photos.ts', 'admin-photos/index.ts']
  .map(path => fs.readFileSync(`supabase/functions/${path}`, 'utf8').replace(/^import .*;$/gm, '').replace(/^export /gm, ''))
  .join('\n');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
const userId = '11111111-1111-4111-8111-111111111111';
const jpeg = new Uint8Array([255, 216, 255, 224, 0, 16, 74, 70, 73, 70]);

function setup({ role = 'admin', authenticated = true, configured = true } = {}) {
  const assets = new Map();
  const queue = new Map();
  const references = new Set();
  const objects = new Map();
  const calls = [];
  const signedRequests = [];
  let failPublish = false;
  let failDelete = false;
  let serve;
  function query(table) {
    let op = 'select', values, filters = [], limit = Infinity, single = false, countOnly = false;
    const q = {
      select(_columns, options) { countOnly = options?.head; return q; },
      insert(v) { op = 'insert'; values = v; return q; },
      update(v) { op = 'update'; values = v; return q; },
      delete() { op = 'delete'; return q; },
      eq(k, v) { filters.push(row => row[k] === v); return q; },
      limit(n) { limit = n; return q; },
      maybeSingle() { single = true; return q; },
      then(resolve, reject) {
        return Promise.resolve().then(() => {
          const store = table === 'photo_assets' ? assets : queue;
          if (op === 'insert') {
            assets.set(values.id, { ...values, created_at: new Date().toISOString() });
            return { error: null };
          }
          const rows = [...store.values()].filter(row => filters.every(f => f(row))).slice(0, limit);
          if (op === 'delete' && rows.some(row => references.has(row.key))) return { error: { code: '23503' } };
          for (const row of rows) {
            if (op === 'update') Object.assign(row, values);
            if (op === 'delete') {
              store.delete(table === 'photo_assets' ? row.id : row.key);
              if (table === 'photo_assets') {
                queue.set(row.key, { key: row.key });
                queue.set(`_uploads/${row.id}`, { key: `_uploads/${row.id}` });
              }
            }
          }
          return { data: countOnly ? null : single ? rows[0] ?? null : rows.map(row => ({ ...row })), error: null, count: rows.length };
        }).then(resolve, reject);
      },
    };
    return q;
  }
  const db = {
    auth: { getUser: async () => ({ data: { user: authenticated ? { id: userId, app_metadata: { role } } : null } }) },
    from: query,
    rpc: async () => ({ error: null }),
  };
  class AwsClient {
    async sign(request) { signedRequests.push(request); return request; }
    async fetch(url, init = {}) {
      const key = new URL(url).pathname.split('/').slice(2).join('/');
      const method = init.method ?? 'GET';
      calls.push({ key, method, ...init });
      if (method === 'GET') {
        const bytes = objects.get(key);
        return bytes ? new Response(bytes, { headers: { 'Content-Length': String(bytes.length) } }) : new Response(null, { status: 404 });
      }
      if (method === 'PUT') {
        if (failPublish) return new Response(null, { status: 503 });
        objects.set(key, init.body);
      }
      if (method === 'DELETE') {
        if (failDelete) return new Response(null, { status: 503 });
        objects.delete(key);
      }
      return new Response(null, { status: 200 });
    }
  }
  const env = {
    R2_ENDPOINT: 'https://account.r2.cloudflarestorage.com',
    R2_PUBLIC_URL: 'https://foto.example.test',
    R2_BUCKET_NAME: 'photos', R2_ACCESS_KEY_ID: 'key', R2_SECRET_ACCESS_KEY: 'secret',
  };
  vm.runInNewContext(compiled, {
    Request, Response, URL, Uint8Array, Date, crypto: webcrypto, AwsClient, createClient: () => db,
    console: { error() {} },
    Deno: { env: { get: name => configured ? env[name] ?? 'test' : undefined }, serve: fn => { serve = fn; } },
  });
  const request = (body, token = 'token') => serve(new Request('https://edge.test/admin-photos', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  }));
  const prepare = async (body = {}) => {
    const response = await request({ action: 'prepare', scope: 'works', type: 'image/jpeg', size: jpeg.length, ...body });
    return { response, ...(await response.json()) };
  };
  return { request, prepare, assets, queue, objects, references, calls, signedRequests,
    failPublishing: () => { failPublish = true; }, failDeleting: () => { failDelete = true; } };
}

test('all photo actions require a verified admin before R2 access', async () => {
  for (const action of ['prepare', 'complete', 'discard', 'cleanup']) {
    for (const [options, token, status] of [[{}, '', 401], [{ authenticated: false }, 'token', 401], [{ role: 'member' }, 'token', 403]]) {
      const app = setup(options);
      assert.equal((await app.request({ action }, token)).status, status);
      assert.equal(app.calls.length, 0);
      assert.equal(app.assets.size, 0);
    }
  }
});

test('invalid file types, destinations and sizes never create upload tickets', async () => {
  const app = setup();
  for (const input of [{ type: 'image/svg+xml' }, { type: '__proto__' }, { scope: '../private' }, { size: 0 }, { size: 10485761 }, { size: 1.5 }]) {
    assert.equal((await app.prepare(input)).response.status, 400);
  }
  assert.equal(app.assets.size, 0);
});

test('uploads go to staging and only verified bytes are published to a separate immutable key', async () => {
  const app = setup();
  const upload = await app.prepare();
  assert.equal(upload.response.status, 201);
  const signed = app.signedRequests[0];
  assert.match(signed.url, /\/_uploads\//);
  assert.equal(new URL(signed.url).searchParams.get('X-Amz-Expires'), '300');
  assert.equal(signed.headers.get('Content-Type'), 'image/jpeg');
  const asset = app.assets.get(upload.id);
  app.objects.set(`_uploads/${upload.id}`, jpeg);
  const result = await app.request({ action: 'complete', id: upload.id });
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { photo: { url_image: `https://foto.example.test/${asset.key}`, image_key: asset.key } });
  assert.equal(asset.status, 'ready');
  assert.ok(app.objects.has(asset.key));
  assert.equal(app.objects.has(`_uploads/${upload.id}`), false);
  assert.match(app.calls.find(call => call.method === 'PUT').headers['Cache-Control'], /immutable/);
  const writes = app.calls.length;
  assert.equal((await app.request({ action: 'complete', id: upload.id })).status, 200);
  assert.equal(app.calls.length, writes, 'retrying completion must never overwrite a ready photo');
});

test('mismatched size and forged MIME types cannot be published', async () => {
  for (const bytes of [new Uint8Array(20), new TextEncoder().encode('<html>bad!')]) {
    const app = setup();
    const upload = await app.prepare();
    app.objects.set(`_uploads/${upload.id}`, bytes);
    assert.equal((await app.request({ action: 'complete', id: upload.id })).status, 400);
    assert.equal(app.calls.some(call => call.method === 'PUT'), false);
    assert.equal(app.assets.get(upload.id).status, 'pending');
  }
});

test('failed publishing can be retried; expired and other-user uploads are rejected', async () => {
  const app = setup();
  const upload = await app.prepare();
  const asset = app.assets.get(upload.id);
  app.objects.set(`_uploads/${upload.id}`, jpeg);
  app.failPublishing();
  assert.equal((await app.request({ action: 'complete', id: upload.id })).status, 502);
  assert.equal(asset.status, 'pending');
  asset.created_at = new Date(Date.now() - 11 * 60000).toISOString();
  assert.equal((await app.request({ action: 'complete', id: upload.id })).status, 410);
  asset.owner_id = 'someone-else';
  assert.equal((await app.request({ action: 'complete', id: upload.id })).status, 404);
});

test('discard protects attached photos and deletes unused photos through the retry queue', async () => {
  const app = setup();
  const upload = await app.prepare();
  const asset = app.assets.get(upload.id);
  app.references.add(asset.key);
  assert.equal((await app.request({ action: 'discard', key: asset.key })).status, 200);
  assert.equal(app.assets.size, 1);
  assert.equal(app.calls.length, 0);
  app.references.clear();
  assert.equal((await app.request({ action: 'discard', key: asset.key })).status, 200);
  assert.equal(app.assets.size, 0);
  assert.ok(app.calls.some(call => call.key === asset.key && call.method === 'DELETE'));
});

test('failed R2 deletions stay queued and cleanup never deletes an attached object', async () => {
  const app = setup();
  app.queue.set('works/orphan.jpg', { key: 'works/orphan.jpg' });
  app.failDeleting();
  const response = await app.request({ action: 'cleanup' });
  assert.equal((await response.json()).remaining, 1);
  assert.equal(app.queue.size, 1);
  const other = setup();
  const upload = await other.prepare();
  const asset = other.assets.get(upload.id);
  other.references.add(asset.key);
  other.queue.set(asset.key, { key: asset.key });
  assert.equal((await other.request({ action: 'cleanup' })).status, 200);
  assert.equal(other.calls.length, 0);
});

test('missing configuration returns an actionable error and malformed inputs fail safely', async () => {
  assert.equal((await setup({ configured: false }).request({ action: 'prepare' })).status, 503);
  const app = setup();
  assert.equal((await app.request(null)).status, 400);
  assert.equal((await app.request({ action: 'unknown' })).status, 400);
  assert.equal((await app.request({ action: 'complete', id: '../evil' })).status, 400);
});
