import type { RankingEntry, Tournament } from "./types";

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
    g.results.forEach((r) => {
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
  const played = t.games.filter((g) => g.results.length > 0).length;
  return Math.round((played / t.games.length) * 100);
}
