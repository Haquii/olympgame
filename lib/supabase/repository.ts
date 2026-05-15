/**
 * Repository : isole tous les accès Supabase derrière une API stable.
 * Les actions/components ne dépendent pas de @supabase/* directement.
 *
 * Toutes les fonctions retournent null/throw si supabaseEnabled === false,
 * pour que le caller puisse fallback sur le store localStorage.
 */

import { getServerClient } from "./server";
import { supabaseEnabled } from "./config";
import type { Tournament, User } from "../types";

export async function listTournamentsRemote(): Promise<Tournament[] | null> {
  if (!supabaseEnabled) return null;
  const sb = await getServerClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from("tournaments")
    .select(
      `id, name, description, banner_emoji, created_by, status, start_date, max_players, created_at,
       tournament_organizers ( profile_id ),
       tournament_players ( profile_id ),
       games (
         id, name, emoji, format, position,
         game_points ( rank, points ),
         game_results ( profile_id, rank ),
         matches ( id, round, position, bracket, player_a, player_b, score_a, score_b, winner_id, next_match_id, next_loser_match_id )
       )`
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] listTournaments:", error.message);
    return null;
  }
  return (data ?? []).map(mapTournament);
}

export async function getCurrentUserRemote(): Promise<User | null> {
  if (!supabaseEnabled) return null;
  const sb = await getServerClient();
  if (!sb) return null;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb
    .from("profiles")
    .select("id, name, avatar_initial, color, joined_at")
    .eq("id", user.id)
    .single();
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar_initial,
    color: profile.color,
    joinedAt: new Date(profile.joined_at).getTime(),
  };
}

/* ---------- mappers ---------- */

function mapTournament(row: any): Tournament {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    bannerEmoji: row.banner_emoji ?? "🏆",
    createdBy: row.created_by,
    organizers: (row.tournament_organizers ?? []).map((o: any) => o.profile_id),
    players: (row.tournament_players ?? []).map((p: any) => p.profile_id),
    status: row.status,
    startDate: row.start_date ?? "",
    maxPlayers: row.max_players,
    games: (row.games ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((g: any) => ({
        id: g.id,
        name: g.name,
        emoji: g.emoji,
        format: g.format,
        pointsSystem: (g.game_points ?? [])
          .sort((a: any, b: any) => a.rank - b.rank)
          .map((p: any) => ({ rank: p.rank, points: p.points })),
        results: (g.game_results ?? []).map((r: any) => ({
          playerId: r.profile_id,
          rank: r.rank,
        })),
        matches: (g.matches ?? []).map((m: any) => ({
          id: m.id,
          round: m.round,
          position: m.position,
          bracket: m.bracket,
          playerA: m.player_a,
          playerB: m.player_b,
          scoreA: m.score_a,
          scoreB: m.score_b,
          winnerId: m.winner_id,
          nextMatchId: m.next_match_id,
          nextLoserMatchId: m.next_loser_match_id,
        })),
      })),
    createdAt: new Date(row.created_at).getTime(),
  };
}
