/**
 * Server-only: verify caller is admin via Bearer access token + profiles.role.
 * Soft-fails when Supabase env is missing.
 */
import { getSupabaseServerClient, isSupabaseConfigured } from './supabase';

export type AdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string };

export async function requireAdminFromRequest(req: Request): Promise<AdminAuthResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      status: 503,
      error: 'Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).',
    };
  }

  const service = getSupabaseServerClient();
  if (!service) {
    return {
      ok: false,
      status: 503,
      error: 'Supabase service role is not configured (missing SUPABASE_SERVICE_ROLE_KEY).',
    };
  }

  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  if (!match) {
    return { ok: false, status: 401, error: 'Missing Authorization Bearer token.' };
  }

  const token = match[1];
  const { data: userData, error: userError } = await service.auth.getUser(token);
  if (userError || !userData.user) {
    return { ok: false, status: 401, error: 'Invalid or expired session.' };
  }

  const { data: profile, error: profileError } = await service
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError) {
    return { ok: false, status: 503, error: 'Could not verify admin profile (migration?).' };
  }
  if (!profile || profile.role !== 'admin') {
    return { ok: false, status: 403, error: 'Admin role required.' };
  }

  return { ok: true, userId: userData.user.id };
}
