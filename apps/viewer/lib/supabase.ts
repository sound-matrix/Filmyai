/**
 * Supabase client stub — placeholders only.
 * Replace with real createClient once keys are set in .env.local.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Browser/client stub. Returns null when keys are empty. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!url || !anonKey) {
    console.warn('[filmyai] Supabase stub: missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY');
    return null;
  }
  return createClient(url, anonKey);
}

/** Server stub using service role when available. */
export function getSupabaseServerClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !serviceKey) {
    console.warn('[filmyai] Supabase server stub: missing URL or SERVICE_ROLE_KEY');
    return null;
  }
  return createClient(url, serviceKey);
}
