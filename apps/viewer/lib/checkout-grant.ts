/**
 * Server-side entitlement grant after verified Razorpay payment (SOU-15).
 * Soft-fails when Supabase/migration missing — returns pending_client_stub.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { EntitlementKind } from '@filmyai/shared';

export type PaymentOrderRow = {
  id: string;
  user_id: string | null;
  stub_email: string | null;
  kind: 'member' | 'special_pay';
  film_slug: string | null;
  amount_cents: number;
  currency: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  status: 'created' | 'paid' | 'failed';
  entitlement_id: string | null;
  raw_notes: Record<string, unknown> | null;
};

export type GrantResult = {
  granted: boolean;
  grant_mode: 'db' | 'pending_client_stub';
  entitlement_id: string | null;
  kind: 'member' | 'special_pay';
  film_slug: string | null;
  already_paid: boolean;
};

async function resolveAuthUserId(
  service: SupabaseClient,
  order: PaymentOrderRow,
  stubEmail?: string | null,
): Promise<string | null> {
  if (order.user_id) return order.user_id;

  const email = (stubEmail ?? order.stub_email ?? '').trim().toLowerCase();
  if (!email) return null;

  // Prefer auth.users lookup via admin API (staging: small user set)
  try {
    const { data, error } = await service.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (!error && data?.users) {
      const match = data.users.find((u) => (u.email ?? '').toLowerCase() === email);
      if (match?.id) return match.id;
    }
  } catch {
    // soft-fail — fall through to pending_client_stub
  }

  return null;
}

async function findExistingEntitlement(
  service: SupabaseClient,
  userId: string,
  kind: EntitlementKind,
  filmSlug: string | null,
): Promise<string | null> {
  let q = service
    .from('entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('kind', kind)
    .limit(1);

  if (kind === 'special_pay' && filmSlug) {
    q = q.eq('film_slug', filmSlug);
  }

  const { data } = await q.maybeSingle();
  return data?.id ?? null;
}

/**
 * Mark order paid (idempotent) and attempt entitlement insert.
 * Never trusts client to skip signature verify — caller must verify first.
 */
export async function markPaidAndGrant(input: {
  service: SupabaseClient | null;
  order: PaymentOrderRow;
  razorpay_payment_id: string;
  stub_email?: string | null;
}): Promise<GrantResult> {
  const { service, order, razorpay_payment_id } = input;
  const kind = order.kind;
  const film_slug = order.film_slug;

  if (!service) {
    return {
      granted: false,
      grant_mode: 'pending_client_stub',
      entitlement_id: null,
      kind,
      film_slug,
      already_paid: order.status === 'paid',
    };
  }

  // Idempotent: already paid with entitlement
  if (order.status === 'paid' && order.entitlement_id) {
    return {
      granted: true,
      grant_mode: 'db',
      entitlement_id: order.entitlement_id,
      kind,
      film_slug,
      already_paid: true,
    };
  }

  const userId = await resolveAuthUserId(service, order, input.stub_email);

  let entitlementId: string | null = order.entitlement_id;

  if (userId) {
    const existing = await findExistingEntitlement(service, userId, kind, film_slug);
    if (existing) {
      entitlementId = existing;
    } else {
      const insertRow: Record<string, unknown> = {
        user_id: userId,
        kind,
        film_id: null,
        film_slug: kind === 'special_pay' ? film_slug : null,
        reason: `Razorpay test-mode purchase (${order.razorpay_order_id})`,
        granted_by: 'purchase',
        expires_at: null,
      };

      const { data: ent, error: entErr } = await service
        .from('entitlements')
        .insert(insertRow)
        .select('id')
        .single();

      if (entErr) {
        console.warn('[filmyai] entitlement insert failed:', entErr.message);
        // Continue — still mark order paid; client stub can unlock UI
      } else {
        entitlementId = ent.id;
      }
    }
  }

  const { error: updErr } = await service
    .from('payment_orders')
    .update({
      status: 'paid',
      razorpay_payment_id,
      entitlement_id: entitlementId,
      user_id: userId ?? order.user_id,
      stub_email: (input.stub_email ?? order.stub_email)?.trim().toLowerCase() || order.stub_email,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  if (updErr) {
    console.warn('[filmyai] payment_orders update failed:', updErr.message);
  }

  if (entitlementId) {
    return {
      granted: true,
      grant_mode: 'db',
      entitlement_id: entitlementId,
      kind,
      film_slug,
      already_paid: order.status === 'paid',
    };
  }

  return {
    granted: false,
    grant_mode: 'pending_client_stub',
    entitlement_id: null,
    kind,
    film_slug,
    already_paid: order.status === 'paid',
  };
}

export async function loadPaymentOrderByRazorpayId(
  service: SupabaseClient,
  razorpayOrderId: string,
): Promise<PaymentOrderRow | null> {
  const { data, error } = await service
    .from('payment_orders')
    .select(
      'id, user_id, stub_email, kind, film_slug, amount_cents, currency, razorpay_order_id, razorpay_payment_id, status, entitlement_id, raw_notes',
    )
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle();

  if (error || !data) return null;
  return data as PaymentOrderRow;
}
