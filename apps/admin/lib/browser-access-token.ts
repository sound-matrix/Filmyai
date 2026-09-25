'use client';

import { getSupabaseBrowserClient } from './supabase';

/** Current access token for admin API calls (null if unavailable). */
export async function getBrowserAccessToken(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
