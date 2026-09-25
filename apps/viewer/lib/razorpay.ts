/**
 * Razorpay TEST MODE helpers (SOU-15).
 * Env (see repo `.env.example`):
 *   NEXT_PUBLIC_RAZORPAY_KEY_ID  — test key id (public)
 *   RAZORPAY_KEY_SECRET          — test secret (server only)
 *   RAZORPAY_WEBHOOK_SECRET      — webhook HMAC (server only; optional until CA wires webhook)
 * Soft-fail when keys missing. No live/prod mode flags. Prefer fetch + Node crypto.
 */
import { createHmac, timingSafeEqual } from 'crypto';

const RAZORPAY_ORDERS_URL = 'https://api.razorpay.com/v1/orders';

export function getRazorpayKeyId(): string {
  return (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '').trim();
}

export function getRazorpayKeySecret(): string {
  return (process.env.RAZORPAY_KEY_SECRET ?? '').trim();
}

export function getRazorpayWebhookSecret(): string {
  return (process.env.RAZORPAY_WEBHOOK_SECRET ?? '').trim();
}

/** True when test key id + secret are present (checkout create/verify). */
export function isRazorpayConfigured(): boolean {
  return Boolean(getRazorpayKeyId() && getRazorpayKeySecret());
}

export function isRazorpayWebhookConfigured(): boolean {
  return Boolean(getRazorpayWebhookSecret());
}

export type CreateRazorpayOrderInput = {
  /** Amount in paise (INR smallest unit) — matches our *_cents fields. */
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
};

export type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt: string | null;
  status: string;
  notes?: Record<string, string>;
};

export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput,
): Promise<RazorpayOrderResponse> {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();
  if (!keyId || !keySecret) {
    throw new Error('Razorpay test keys not configured');
  }

  const amount = Math.round(input.amountPaise);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('amountPaise must be a positive integer');
  }

  const body = {
    amount,
    currency: (input.currency ?? 'INR').toUpperCase(),
    receipt: input.receipt.slice(0, 40),
    notes: input.notes ?? {},
  };

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const res = await fetch(RAZORPAY_ORDERS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as RazorpayOrderResponse & {
    error?: { description?: string; code?: string };
  };

  if (!res.ok || !json.id) {
    const desc = json.error?.description || `Razorpay order create failed (${res.status})`;
    throw new Error(desc);
  }

  return {
    id: json.id,
    amount: json.amount,
    currency: json.currency,
    receipt: json.receipt ?? null,
    status: json.status,
    notes: json.notes,
  };
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Checkout.js payment signature: HMAC-SHA256(orderId|paymentId, KEY_SECRET).
 * Fail closed — callers must reject on false.
 */
export function verifyPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = getRazorpayKeySecret();
  const { orderId, paymentId, signature } = input;
  if (!secret || !orderId || !paymentId || !signature) return false;
  const expected = createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return safeEqualHex(expected, signature);
}

/**
 * Webhook signature: HMAC-SHA256(rawBody, WEBHOOK_SECRET) compared to
 * X-Razorpay-Signature header. Fail closed.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = getRazorpayWebhookSecret();
  if (!secret || !rawBody || !signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeEqualHex(expected, signature);
}
