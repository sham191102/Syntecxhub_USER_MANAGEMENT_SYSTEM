import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createUserSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema
} from '../src/validation/schemas.js';

test('registration normalizes email and does not permit a role', () => {
  const result = registerSchema.safeParse({
    name: 'Sam User',
    email: 'SAM@EXAMPLE.COM',
    password: 'a-safe-password',
    role: 'admin'
  });

  assert.equal(result.success, false);
});

test('registration normalizes email and accepts a valid user', () => {
  const result = registerSchema.parse({
    name: 'Sam User',
    email: 'SAM@EXAMPLE.COM',
    password: 'a-safe-password'
  });

  assert.equal(result.email, 'sam@example.com');
});

test('admin creation schema allows an explicit role', () => {
  const result = createUserSchema.parse({
    name: 'Project Admin',
    email: 'ADMIN@example.com',
    password: 'a-safe-password',
    role: 'admin'
  });

  assert.equal(result.role, 'admin');
});

test('login rejects an empty password', () => {
  assert.equal(loginSchema.safeParse({
    email: 'sam@example.com',
    password: ''
  }).success, false);
});

test('profile updates must include at least one allowed field', () => {
  assert.equal(updateProfileSchema.safeParse({}).success, false);
  assert.equal(updateProfileSchema.safeParse({ role: 'admin' }).success, false);
});
