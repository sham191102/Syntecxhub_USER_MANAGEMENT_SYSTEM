import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';

let server;
let baseUrl;

before(async () => {
  process.env.MONGODB_URI ??= 'mongodb://127.0.0.1/test';
  process.env.JWT_SECRET ??= 'test-secret-that-is-at-least-thirty-two-characters';

  const { app } = await import('../src/app.js');
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test('health endpoint responds without a database connection', async () => {
  const response = await fetch(`${baseUrl}/api/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('public registration rejects attempts to assign administrator role', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Sam User',
      email: 'sam@example.com',
      password: 'a-safe-password',
      role: 'admin'
    })
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, 'Invalid request data');
});

test('administrator-only directory endpoints reject unauthenticated requests', async () => {
  const response = await fetch(`${baseUrl}/api/users/stats`);

  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, 'A bearer token is required');
});

test('unknown routes return a not-found response', async () => {
  const response = await fetch(`${baseUrl}/missing`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Route not found' });
});
