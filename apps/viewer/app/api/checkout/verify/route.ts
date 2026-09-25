import { NextResponse } from 'next/server';
import {
  loadPaymentOrderByRazorpayId,
  markPaidAndGrant,
  type PaymentOrderRow,
} from '../../../../lib/checkout-grant';
import { isRazorpayConfigured, verifyPaymentSignature } from '../../../../lib/razorpay';
import { getSupabaseServerClient } from '../../../../lib/supabase';

type VerifyBody = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  stub_email?: string;
};

export async function POST(req: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Razorpay test keys not configured' },
      { status: 503 },
    );
  }

  let body: VerifyBody;
  try {
    body = (await req.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const orderId = body.razorpay_order_id?.trim() ?? '';
  const paymentId = body.razorpay_payment_id?.trim() ?? '';
  const signature = body.razorpay_signature?.trim() ?? '';

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json(
      { ok: false, error: 'Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature.' },
      { status: 400 },
    );
  }

  // Fail closed — never trust client to skip verify
  const valid = verifyPaymentSignature({ orderId, paymentId, signature });
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: 'Invalid payment signature.' },
      { status: 400 },
    );
  }

  const service = getSupabaseServerClient();
  let order: PaymentOrderRow | null = null;

  if (service) {
    order = await loadPaymentOrderByRazorpayId(service, orderId);
  }

  if (!order) {
    // Soft path when migration missing: signature already verified — unlock client stub
    return NextResponse.json({
      ok: true,
      granted: false,
      grant_mode: 'pending_client_stub' as const,
      kind: null,
      film_slug: null,
      message:
        'Signature verified but payment_orders row missing — apply migration 0004 (CA). Client stub unlock OK.',
    });
  }

  const result = await markPaidAndGrant({
    service,
    order,
    razorpay_payment_id: paymentId,
    stub_email: body.stub_email,
  });

  return NextResponse.json({
    ok: true,
    granted: result.granted,
    grant_mode: result.grant_mode,
    kind: result.kind,
    film_slug: result.film_slug,
    already_paid: result.already_paid,
  });
}
