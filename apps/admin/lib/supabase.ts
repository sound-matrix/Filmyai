/**
 * Supabase client helpers — soft-fail when env keys are missing.
 * Env names (see repo `.env.example`):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_APP_URL
 * Do not invent real keys. Wire live auth only after CA Staging keys land.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

let browserClient: SupabaseClient | null | undefined;

/** True when browser-safe Supabase public env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;
  if (!url || !anonKey) {
    console.warn('[filmyai-admin] Supabase: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    browserClient = null;
    return null;
  }
  browserClient = createClient(url, anonKey);
  return browserClient;
}

export function getSupabaseServerClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !serviceKey) {
    console.warn('[filmyai-admin] Supabase server: missing URL or SUPABASE_SERVICE_ROLE_KEY');
    return null;
  }
  return createClient(url, serviceKey);
}
