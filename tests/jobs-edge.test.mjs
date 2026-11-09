import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import ts from 'typescript';

const read = path => fs.readFileSync(`supabase/functions/${path}`, 'utf8');
function handler(db, endpoint = 'jobs') {
  const entry = read(`${endpoint}/index.ts`).replace(/^import .*;$/gm, '');
  const source = ts.transpileModule(entry, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  let serve;
  vm.runInNewContext(source, { Request, Response, console: { error() {} }, createClient: () => db, Deno: { env: { get: () => 'test' }, serve: fn => { serve = fn; } } });
  return (body, token) => serve(new Request('https://example.test/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) }));
}
test('every admin action requires authentication before database access', async () => {
  for (const action of ['list', 'save', 'delete']) {
    const response = await handler({}, "admin-jobs")({ action });
    assert.equal(response.status, 401);
  }
});
test('non-admin users cannot read applications or mutate jobs', async () => {
  for (const action of ['list', 'save', 'delete']) {
    const response = await handler({ auth: { getUser: async () => ({ data: { user: { app_metadata: { role: 'member' } } } }) } }, 'admin-jobs')({ action }, 'token');
    assert.equal(response.status, 403);
  }
});
test('public company submissions cannot publish themselves', async () => {
  let inserted;
  const call = handler({ from: () => ({ insert: values => { inserted = values; return { select: () => ({ single: async () => ({ data: values }) }) }; } }) });
  const response = await call({ action: 'submit', company: 'Studio', email: 'HELLO@example.com', title: 'Designer', location: 'Remote', description: 'A creative role', status: 'published' });
  assert.equal(response.status, 200);
  assert.equal(inserted.status, 'pending');
  assert.equal(inserted.email, 'hello@example.com');
  assert.deepEqual(await response.json(), { ok: true });
});
test('invalid public inputs and honeypot submissions do not touch the database', async () => {
  assert.equal((await handler({})({ action: 'apply', job_id: 'bad' })).status, 400);
  assert.equal((await handler({})({ action: 'submit', website: 'spam' })).status, 400);
  assert.equal((await handler({})({ action: 'submit', company: 42 })).status, 400);
});
test('closed positions and duplicate applications return conflicts', async () => {
  for (const code of ['P0001', '23505']) {
    const response = await handler({ rpc: async () => ({ error: { code } }) })({ action: 'apply', job_id: '12345678-1234-1234-1234-123456789012', name: 'Test', email: 'test@example.com', message: '' });
    assert.equal(response.status, 409);
  }
});
