import { NextResponse } from 'next/server';
import { createRazorpayOrder, getRazorpayKeyId, isRazorpayConfigured } from '../../../../lib/razorpay';
import { getSupabaseServerClient } from '../../../../lib/supabase';

const DEFAULT_MEMBER_CENTS = 49900;
const DEFAULT_SPECIAL_CENTS = 9900;

type CreateOrderBody = {
  kind?: string;
  film_slug?: string;
  stub_email?: string;
  stub_user_id?: string;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function POST(req: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Razorpay test keys not configured' },
      { status: 503 },
    );
  }

  let body: CreateOrderBody;
  try {
    body = (await req.json()) as CreateOrderBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const kind = body.kind === 'special_pay' ? 'special_pay' : body.kind === 'member' ? 'member' : null;
  if (!kind) {
    return NextResponse.json(
      { ok: false, error: "kind must be 'member' or 'special_pay'." },
      { status: 400 },
    );
  }

  const film_slug =
    kind === 'special_pay'
      ? (body.film_slug?.trim() || 'placeholder')
      : body.film_slug?.trim() || null;

  if (kind === 'special_pay' && !film_slug) {
    return NextResponse.json(
      { ok: false, error: 'film_slug is required for special_pay.' },
      { status: 400 },
    );
  }

  const stub_email = body.stub_email?.trim().toLowerCase() || null;
  const stub_user_id =
    body.stub_user_id && isUuid(body.stub_user_id.trim()) ? body.stub_user_id.trim() : null;

  const service = getSupabaseServerClient();

  let amount_cents = kind === 'member' ? DEFAULT_MEMBER_CENTS : DEFAULT_SPECIAL_CENTS;
  let currency = 'INR';

  if (service) {
    if (kind === 'member') {
      const { data } = await service
        .from('pricing_settings')
        .select('member_price_cents, member_currency')
        .eq('id', 1)
        .maybeSingle();
      if (data?.member_price_cents && data.member_price_cents > 0) {
        amount_cents = data.member_price_cents;
      }
      if (data?.member_currency) {
        currency = String(data.member_currency).toUpperCase();
      }
    } else if (film_slug) {
      const { data } = await service
        .from('film_access')
        .select('special_pay_price_cents')
        .eq('slug', film_slug)
        .maybeSingle();
      if (data?.special_pay_price_cents && data.special_pay_price_cents > 0) {
        amount_cents = data.special_pay_price_cents;
      }
    }
  }

  const receipt = `sou15_${kind}_${Date.now().toString(36)}`.slice(0, 40);
  const notes: Record<string, string> = {
    kind,
    staging: 'true',
    sou: '15',
  };
  if (film_slug) notes.film_slug = film_slug;
  if (stub_email) notes.stub_email = stub_email;

  let razorpayOrder;
  try {
    razorpayOrder = await createRazorpayOrder({
      amountPaise: amount_cents,
      currency,
      receipt,
      notes,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Razorpay order create failed';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  if (service) {
    const { error: insertErr } = await service.from('payment_orders').insert({
      user_id: stub_user_id,
      stub_email,
      kind,
      film_slug: kind === 'special_pay' ? film_slug : null,
      amount_cents,
      currency,
      razorpay_order_id: razorpayOrder.id,
      status: 'created',
      raw_notes: notes,
    });

    if (insertErr) {
      console.warn(
        '[filmyai] payment_orders insert failed (apply migration 0004?):',
        insertErr.message,
      );
      // Soft-fail: still return order so Checkout.js can open; verify may use Razorpay only
    }
  }

  return NextResponse.json({
    ok: true,
    key_id: getRazorpayKeyId(),
    order_id: razorpayOrder.id,
    amount: amount_cents,
    currency,
    kind,
    film_slug: kind === 'special_pay' ? film_slug : null,
  });
}
