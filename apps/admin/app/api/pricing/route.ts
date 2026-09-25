import { NextResponse } from 'next/server';
import type { PricingSettings } from '@filmyai/shared';
import { requireAdminFromRequest } from '../../../lib/admin-api-auth';
import { getSupabaseServerClient, isSupabaseConfigured } from '../../../lib/supabase';

const LOCAL_FALLBACK: PricingSettings = {
  member_price_cents: 49900,
  member_currency: 'INR',
  updated_at: new Date(0).toISOString(),
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      source: 'fallback',
      pricing: LOCAL_FALLBACK,
      message: 'Supabase env missing — returning local default. Apply migration 0003 + env for live pricing.',
    });
  }

  const service = getSupabaseServerClient();
  if (!service) {
    return NextResponse.json({
      ok: true,
      source: 'fallback',
      pricing: LOCAL_FALLBACK,
      message: 'Service role missing — local default only.',
    });
  }

  const { data, error } = await service
    .from('pricing_settings')
    .select('member_price_cents, member_currency, updated_at')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({
      ok: true,
      source: 'fallback',
      pricing: LOCAL_FALLBACK,
      message: `pricing_settings unavailable (${error.message}). Apply 20260925_0003_access_model.sql (CA).`,
    });
  }

  if (!data) {
    return NextResponse.json({
      ok: true,
      source: 'fallback',
      pricing: LOCAL_FALLBACK,
      message: 'No pricing_settings row — seed via migration 0003.',
    });
  }

  const pricing: PricingSettings = {
    member_price_cents: data.member_price_cents,
    member_currency: data.member_currency,
    updated_at: data.updated_at,
  };

  return NextResponse.json({ ok: true, source: 'supabase', pricing });
}

export async function PATCH(req: Request) {
  const auth = await requireAdminFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const service = getSupabaseServerClient();
  if (!service) {
    return NextResponse.json(
      { ok: false, error: 'Service role not configured.' },
      { status: 503 },
    );
  }

  let body: { member_price_cents?: number; member_currency?: string };
  try {
    body = (await req.json()) as { member_price_cents?: number; member_currency?: string };
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const cents = body.member_price_cents;
  if (typeof cents !== 'number' || !Number.isFinite(cents) || cents < 0 || !Number.isInteger(cents)) {
    return NextResponse.json(
      { ok: false, error: 'member_price_cents must be a non-negative integer.' },
      { status: 400 },
    );
  }

  const currency =
    typeof body.member_currency === 'string' && body.member_currency.trim()
      ? body.member_currency.trim().toUpperCase()
      : 'INR';

  const { data, error } = await service
    .from('pricing_settings')
    .upsert(
      {
        id: 1,
        member_price_cents: cents,
        member_currency: currency,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select('member_price_cents, member_currency, updated_at')
    .single();

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: `Could not update pricing_settings (${error.message}). Apply migration 0003 (CA).`,
      },
      { status: 503 },
    );
  }

  const pricing: PricingSettings = {
    member_price_cents: data.member_price_cents,
    member_currency: data.member_currency,
    updated_at: data.updated_at,
  };

  return NextResponse.json({ ok: true, source: 'supabase', pricing });
}
