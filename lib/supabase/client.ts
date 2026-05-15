/**
 * Client Supabase côté navigateur.
 *
 * Note d'implémentation : on n'importe @supabase/supabase-js que lorsque les env vars
 * sont présentes, pour ne pas alourdir le bundle de la version localStorage.
 *
 * Pour activer :
 *   1. npm install @supabase/supabase-js @supabase/ssr
 *   2. Configurer NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans Vercel
 *   3. Exécuter supabase/schema.sql dans le SQL Editor du projet Supabase
 */

import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseEnabled } from "./config";

let _client: any = null;

export async function getBrowserClient() {
  if (!supabaseEnabled) return null;
  if (_client) return _client;
  // Dynamic import pour ne pas inclure dans le bundle si désactivé
  // @ts-ignore — optional dep, install only when enabling Supabase
  const mod: any = await import("@supabase/supabase-js" as any).catch(() => null);
  if (!mod) {
    console.warn(
      "[Olymp'Game] @supabase/supabase-js non installé. Run: npm install @supabase/supabase-js"
    );
    return null;
  }
  _client = mod.createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return _client;
}
