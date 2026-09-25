import { NextResponse } from 'next/server';
import { normalizeAccessRule, type AccessRule, type FilmAccess } from '@filmyai/shared';
import { requireAdminFromRequest } from '../../../lib/admin-api-auth';
import { getSupabaseServerClient, isSupabaseConfigured } from '../../../lib/supabase';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug')?.trim();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      source: 'fallback',
      rows: [] as FilmAccess[],
      message: 'Supabase env missing — film_access not available.',
    });
  }

  const service = getSupabaseServerClient();
  if (!service) {
    return NextResponse.json({
      ok: true,
      source: 'fallback',
      rows: [] as FilmAccess[],
      message: 'Service role missing.',
    });
  }

  let query = service
    .from('film_access')
    .select('id, slug, access_rule, special_pay_price_cents, updated_at');

  if (slug) query = query.eq('slug', slug);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({
      ok: true,
      source: 'fallback',
      rows: [] as FilmAccess[],
      message: `film_access unavailable (${error.message}). Apply 0003 (CA).`,
    });
  }

  return NextResponse.json({ ok: true, source: 'supabase', rows: data ?? [] });
}

export async function PUT(req: Request) {
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

  let body: {
    slug?: string;
    access_rule?: string;
    special_pay_price_cents?: number | null;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const slug = body.slug?.trim();
  if (!slug) {
    return NextResponse.json({ ok: false, error: 'slug is required.' }, { status: 400 });
  }

  const access_rule: AccessRule = normalizeAccessRule(body.access_rule ?? 'free');
  let special_pay_price_cents: number | null =
    typeof body.special_pay_price_cents === 'number' ? body.special_pay_price_cents : null;

  if (access_rule !== 'special_pay') {
    special_pay_price_cents = null;
  } else if (
    special_pay_price_cents === null ||
    !Number.isInteger(special_pay_price_cents) ||
    special_pay_price_cents <= 0
  ) {
    return NextResponse.json(
      { ok: false, error: 'special_pay requires special_pay_price_cents > 0.' },
      { status: 400 },
    );
  }

  const { data, error } = await service
    .from('film_access')
    .upsert(
      {
        slug,
        access_rule,
        special_pay_price_cents,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' },
    )
    .select('id, slug, access_rule, special_pay_price_cents, updated_at')
    .single();

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: `Could not upsert film_access (${error.message}). Apply migration 0003 (CA).`,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, source: 'supabase', row: data });
}
