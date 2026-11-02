import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthPayload } from '../src/auth-form.js';

test('login sends only email and password, not the unused signup name', () => {
  const payload = createAuthPayload('login', {
    name: '',
    email: '  sham@gmail.com  ',
    password: 'existing-password'
  });

  assert.deepEqual(payload, {
    email: 'sham@gmail.com',
    password: 'existing-password'
  });
  assert.equal('name' in payload, false);
});

test('registration sends the trimmed name and normalized email', () => {
  const payload = createAuthPayload('register', {
    name: '  Sham Pandey  ',
    email: '  sham@gmail.com  ',
    password: 'new-password'
  });

  assert.deepEqual(payload, {
    name: 'Sham Pandey',
    email: 'sham@gmail.com',
    password: 'new-password'
  });
});
