import type { GameResult, RankingEntry, Tournament } from "./types";
import { rankingFromMatches } from "./formats";

function effectiveResults(g: Tournament["games"][number]): GameResult[] {
  const format = g.format ?? "ranked";
  if (format === "ranked") return g.results;
  if (!g.matches || g.matches.length === 0) return [];
  const allDone =
    format === "round_robin" || format === "swiss"
      ? g.matches.every((m) => m.winnerId)
      : g.matches.some(
          (m) =>
            m.round === Math.max(...g.matches!.map((x) => x.round)) &&
            m.winnerId
        );
  if (!allDone) {
    return rankingFromMatches(g.matches, [], format).filter((r) => r.rank > 0);
  }
  const playerSet = new Set<string>();
  g.matches.forEach((m) => {
    if (m.playerA) playerSet.add(m.playerA);
    if (m.playerB) playerSet.add(m.playerB);
  });
  return rankingFromMatches(g.matches, [...playerSet], format);
}

export function computeRanking(t: Tournament): RankingEntry[] {
  const totals = new Map<string, RankingEntry>();
  t.players.forEach((pid) => {
    totals.set(pid, {
      playerId: pid,
      points: 0,
      gamesPlayed: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
    });
  });
  t.games.forEach((g) => {
    const results = effectiveResults(g);
    results.forEach((r) => {
      const entry = totals.get(r.playerId);
      if (!entry) return;
      const ps = g.pointsSystem.find((p) => p.rank === r.rank);
      entry.points += ps ? ps.points : 0;
      entry.gamesPlayed += 1;
      if (r.rank === 1) entry.gold += 1;
      else if (r.rank === 2) entry.silver += 1;
      else if (r.rank === 3) entry.bronze += 1;
    });
  });
  return Array.from(totals.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gold !== a.gold) return b.gold - a.gold;
    if (b.silver !== a.silver) return b.silver - a.silver;
    return b.bronze - a.bronze;
  });
}

export function tournamentProgress(t: Tournament): number {
  if (t.games.length === 0) return 0;
  const played = t.games.filter((g) => {
    const format = g.format ?? "ranked";
    if (format === "ranked") return g.results.length > 0;
    return g.matches?.some((m) => m.winnerId) ?? false;
  }).length;
  return Math.round((played / t.games.length) * 100);
}
