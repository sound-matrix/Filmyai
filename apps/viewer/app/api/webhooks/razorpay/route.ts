import { NextResponse } from 'next/server';
import {
  loadPaymentOrderByRazorpayId,
  markPaidAndGrant,
} from '../../../../lib/checkout-grant';
import {
  isRazorpayWebhookConfigured,
  verifyWebhookSignature,
} from '../../../../lib/razorpay';
import { getSupabaseServerClient } from '../../../../lib/supabase';

/**
 * Razorpay webhook (staging / test mode).
 * Documented URL: https://project-xdwxk.vercel.app/api/webhooks/razorpay
 * Fail closed on bad signature. 503 if WEBHOOK_SECRET missing.
 */
export async function POST(req: Request) {
  if (!isRazorpayWebhookConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Razorpay webhook secret not configured' },
      { status: 503 },
    );
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: 'Invalid webhook signature.' }, { status: 400 });
  }

  let payload: {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string; status?: string } };
      order?: { entity?: { id?: string; status?: string } };
    };
  };

  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const event = payload.event ?? '';
  const paymentEntity = payload.payload?.payment?.entity;
  const orderEntity = payload.payload?.order?.entity;

  const razorpayOrderId =
    paymentEntity?.order_id?.trim() || orderEntity?.id?.trim() || '';
  const razorpayPaymentId = paymentEntity?.id?.trim() || '';

  if (event !== 'payment.captured' && event !== 'order.paid') {
    return NextResponse.json({ ok: true, ignored: true, event });
  }

  if (!razorpayOrderId) {
    return NextResponse.json({ ok: true, ignored: true, reason: 'no_order_id', event });
  }

  const service = getSupabaseServerClient();
  if (!service) {
    return NextResponse.json(
      { ok: false, error: 'Supabase service role not configured' },
      { status: 503 },
    );
  }

  const order = await loadPaymentOrderByRazorpayId(service, razorpayOrderId);
  if (!order) {
    return NextResponse.json({
      ok: true,
      ignored: true,
      reason: 'order_not_found',
      event,
    });
  }

  if (order.status === 'paid' && order.entitlement_id) {
    return NextResponse.json({
      ok: true,
      already_paid: true,
      granted: true,
      grant_mode: 'db',
      kind: order.kind,
      film_slug: order.film_slug,
    });
  }

  const paymentId = razorpayPaymentId || order.razorpay_payment_id || `webhook_${event}`;
  const result = await markPaidAndGrant({
    service,
    order,
    razorpay_payment_id: paymentId,
  });

  return NextResponse.json({
    ok: true,
    granted: result.granted,
    grant_mode: result.grant_mode,
    kind: result.kind,
    film_slug: result.film_slug,
    already_paid: result.already_paid,
    event,
  });
}
