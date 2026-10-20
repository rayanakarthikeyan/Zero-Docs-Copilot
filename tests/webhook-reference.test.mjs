import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createWebhookValidator } from '../examples/webhook-reference.mjs';

const secret = 'fictional-test-signing-secret';
const sign = (raw) => createHmac('sha256', secret).update(raw).digest('hex');
test('accepts a valid signed amount in integer paise', () => {
  const raw = JSON.stringify({ id: 'evt-1', amount: 49900 });
  assert.equal(createWebhookValidator(secret)(raw, sign(raw), 'evt-1', 49900).status, 200);
});
test('rejects a forged signature', () => {
  const raw = JSON.stringify({ id: 'evt-1', amount: 49900 });
  assert.equal(createWebhookValidator(secret)(raw, '0'.repeat(64), 'evt-1', 49900).status, 400);
});
test('rejects replay of the same event', () => {
  const raw = JSON.stringify({ id: 'evt-1', amount: 49900 });
  const validate = createWebhookValidator(secret);
  assert.equal(validate(raw, sign(raw), 'evt-1', 49900).status, 200);
  assert.equal(validate(raw, sign(raw), 'evt-1', 49900).status, 409);
});
test('rejects fractional, negative, unsafe and nonfinite amounts', () => {
  for (const amount of [0, -1, 499.5, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity]) {
    const raw = JSON.stringify({ id: 'evt-1', amount });
    assert.equal(createWebhookValidator(secret)(raw, sign(raw), 'evt-1', amount).status, 400);
  }
});
test('validates signed payload correspondence, not just a valid signature', () => {
  const raw = JSON.stringify({ id: 'evt-1', amount: 49900 });
  assert.equal(createWebhookValidator(secret)(raw, sign(raw), 'evt-2', 49900).status, 400);
});
test('rejects malformed and wrong-length signatures without throwing', () => {
  const validate = createWebhookValidator(secret);
  for (const signature of ['', 'abc', 'zz'.repeat(32)]) assert.equal(validate('{}', signature, 'x', 1).status, 400);
});
