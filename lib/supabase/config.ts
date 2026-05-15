/**
 * Configuration centrale : Supabase est-il activé ?
 *
 * Tant que NEXT_PUBLIC_SUPABASE_URL n'est pas défini, l'app continue
 * à utiliser localStorage (mode démo). Quand les env vars sont présentes,
 * les Server Actions Supabase prennent le relais.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled =
  typeof SUPABASE_URL === "string" &&
  SUPABASE_URL.length > 0 &&
  typeof SUPABASE_ANON_KEY === "string" &&
  SUPABASE_ANON_KEY.length > 0;
