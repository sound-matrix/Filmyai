/**
 * Supabase client stub — placeholders only.
 * No real writes in SOU-11 scaffold.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!url || !anonKey) {
    console.warn('[filmyai-admin] Supabase stub: missing URL or ANON_KEY');
    return null;
  }
  return createClient(url, anonKey);
}

export function getSupabaseServerClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !serviceKey) {
    console.warn('[filmyai-admin] Supabase server stub: missing URL or SERVICE_ROLE_KEY');
    return null;
  }
  return createClient(url, serviceKey);
}
