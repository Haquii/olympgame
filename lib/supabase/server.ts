/**
 * Client Supabase côté serveur (Server Actions, Route Handlers).
 * Utilise @supabase/ssr pour gérer les cookies d'auth d'App Router.
 *
 * À activer après installation des deps :
 *   npm install @supabase/supabase-js @supabase/ssr
 */

import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseEnabled } from "./config";

export async function getServerClient() {
  if (!supabaseEnabled) return null;
  // dynamic import pour ne pas bundle si désactivé
  // @ts-ignore — optional dep
  const ssr: any = await import("@supabase/ssr" as any).catch(() => null);
  if (!ssr) {
    console.warn(
      "[Olymp'Game] @supabase/ssr non installé. Run: npm install @supabase/ssr"
    );
    return null;
  }
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();
  return ssr.createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      get: (n: string) => cookieStore.get(n)?.value,
      set: (n: string, v: string, opts: any) => {
        try {
          cookieStore.set({ name: n, value: v, ...opts });
        } catch {
          // Server Component cannot set cookies — middleware ou Route Handler requis
        }
      },
      remove: (n: string, opts: any) => {
        try {
          cookieStore.set({ name: n, value: "", ...opts });
        } catch {
          /* idem */
        }
      },
    },
  });
}
