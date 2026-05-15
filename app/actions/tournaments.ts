"use server";

/**
 * Server Actions pour les mutations tournament.
 * Quand Supabase est activé, ces actions remplacent les mutations Zustand côté client.
 */

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";
import { supabaseEnabled } from "@/lib/supabase/config";

export async function createTournamentAction(formData: FormData) {
  if (!supabaseEnabled) return { ok: false, error: "Backend désactivé" };
  const sb = await getServerClient();
  if (!sb) return { ok: false, error: "Client Supabase indisponible" };

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Nom requis" };

  const { data, error } = await sb
    .from("tournaments")
    .insert({
      name,
      description: String(formData.get("description") ?? ""),
      banner_emoji: String(formData.get("bannerEmoji") ?? "🏆"),
      created_by: user.id,
      start_date: formData.get("startDate") || null,
      max_players: Number(formData.get("maxPlayers") ?? 12),
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  await sb.from("tournament_organizers").insert({ tournament_id: data.id, profile_id: user.id });
  await sb.from("tournament_players").insert({ tournament_id: data.id, profile_id: user.id });

  revalidatePath("/tournois");
  revalidatePath(`/tournois/${data.id}`);
  return { ok: true, id: data.id };
}

export async function joinTournamentAction(tournamentId: string) {
  if (!supabaseEnabled) return { ok: false, error: "Backend désactivé" };
  const sb = await getServerClient();
  if (!sb) return { ok: false, error: "Client Supabase indisponible" };
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { error } = await sb.from("tournament_players").insert({ tournament_id: tournamentId, profile_id: user.id });
  if (error && !error.message.includes("duplicate")) return { ok: false, error: error.message };

  revalidatePath(`/tournois/${tournamentId}`);
  return { ok: true };
}

export async function leaveTournamentAction(tournamentId: string) {
  if (!supabaseEnabled) return { ok: false, error: "Backend désactivé" };
  const sb = await getServerClient();
  if (!sb) return { ok: false, error: "Client Supabase indisponible" };
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { error } = await sb.from("tournament_players").delete().match({ tournament_id: tournamentId, profile_id: user.id });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/tournois/${tournamentId}`);
  return { ok: true };
}
