// Executable reference behavior. This does not validate generated source code.
import { createHmac, timingSafeEqual } from 'node:crypto';

export function createWebhookValidator(secret) {
  if (typeof secret !== 'string' || secret.length < 16) throw Error('Use a test signing secret of at least 16 characters');
  const seen = new Set();
  return function validate(rawBody, signature, eventId, amountPaise) {
    if (typeof rawBody !== 'string' || typeof signature !== 'string' ||
        !/^[a-f0-9]{64}$/i.test(signature)) return { status: 400, reason: 'invalid_signature' };
    const expected = createHmac('sha256', secret).update(rawBody).digest();
    const supplied = Buffer.from(signature, 'hex');
    if (!timingSafeEqual(expected, supplied)) return { status: 400, reason: 'invalid_signature' };
    if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) return { status: 400, reason: 'invalid_amount' };
    if (typeof eventId !== 'string' || !eventId.trim()) return { status: 400, reason: 'missing_event_id' };
    let body;
    try { body = JSON.parse(rawBody); } catch { return { status: 400, reason: 'invalid_json' }; }
    if (body.id !== eventId || body.amount !== amountPaise) return { status: 400, reason: 'payload_mismatch' };
    if (seen.has(eventId)) return { status: 409, reason: 'duplicate_event' };
    seen.add(eventId);
    return { status: 200, reason: 'accepted' };
  };
}
