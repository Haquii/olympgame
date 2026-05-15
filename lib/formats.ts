import type { Match, GameFormat } from "./types";
import { uid } from "./utils";

/* ------------------------------------------------------------------
 * Algorithmes d'appariement pour les différents formats de tournoi.
 * Tous renvoient une liste de Match prête à être stockée sur le Game.
 * ------------------------------------------------------------------ */

/** Mélange Fisher-Yates (seedé optionnellement). */
function shuffle<T>(arr: T[], seed?: number): T[] {
  const a = [...arr];
  let s = seed ?? Math.floor(Math.random() * 1e9);
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Plus petite puissance de 2 ≥ n. */
function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

/**
 * ROUND ROBIN — chacun affronte chacun, méthode du cercle.
 * Pour n joueurs : n-1 rounds (n) ou n rounds (n+1 impair, avec un bye par round).
 */
export function generateRoundRobin(players: string[]): Match[] {
  const ps = [...players];
  if (ps.length < 2) return [];
  // ajoute un "bye" si impair
  const hasBye = ps.length % 2 === 1;
  if (hasBye) ps.push("__BYE__");

  const n = ps.length;
  const rounds = n - 1;
  const matches: Match[] = [];

  // méthode du cercle : on fixe le premier, on tourne les autres
  const fixed = ps[0];
  let rotating = ps.slice(1);

  for (let r = 1; r <= rounds; r++) {
    const roundPairs: [string, string][] = [];
    // paire fixed avec le dernier de rotating
    roundPairs.push([fixed, rotating[rotating.length - 1]]);
    // paires symétriques sur rotating[0..n-3]
    for (let i = 0; i < (rotating.length - 1) / 2; i++) {
      roundPairs.push([rotating[i], rotating[rotating.length - 2 - i]]);
    }
    roundPairs.forEach((pair, pos) => {
      if (pair[0] === "__BYE__" || pair[1] === "__BYE__") return; // skip byes
      matches.push({
        id: uid("m"),
        round: r,
        position: pos,
        playerA: pair[0],
        playerB: pair[1],
        scoreA: null,
        scoreB: null,
        winnerId: null,
      });
    });
    // rotate (tout sauf le premier)
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)];
  }

  return matches;
}

/**
 * SINGLE ELIMINATION — bracket à élimination directe.
 * Gère les byes pour les puissances non-2 (les têtes de série passent au round 2).
 */
export function generateSingleElim(players: string[]): Match[] {
  const n = players.length;
  if (n < 2) return [];
  const size = nextPow2(n);
  const byes = size - n;

  // Les byes vont aux N premiers joueurs (assimilés "têtes de série")
  // Round 1 = (size/2) matches, certains avec un seul joueur (l'autre = null = bye auto-avance)
  const slots: (string | null)[] = [...players];
  for (let i = 0; i < byes; i++) slots.push(null);

  const matches: Match[] = [];
  let currentRound: Match[] = [];
  const totalRounds = Math.log2(size);

  // Round 1
  for (let i = 0; i < size / 2; i++) {
    const playerA = slots[i * 2];
    const playerB = slots[i * 2 + 1];
    const m: Match = {
      id: uid("m"),
      round: 1,
      position: i,
      playerA,
      playerB,
      scoreA: null,
      scoreB: null,
      winnerId: null,
    };
    // si bye, auto-avance le joueur présent
    if (playerA && !playerB) m.winnerId = playerA;
    else if (!playerA && playerB) m.winnerId = playerB;
    currentRound.push(m);
    matches.push(m);
  }

  // Rounds suivants : génère les matches vides chaînés
  let prev = currentRound;
  for (let r = 2; r <= totalRounds; r++) {
    const nextRound: Match[] = [];
    const matchesInRound = size / 2 ** r;
    for (let i = 0; i < matchesInRound; i++) {
      const m: Match = {
        id: uid("m"),
        round: r,
        position: i,
        playerA: null,
        playerB: null,
        scoreA: null,
        scoreB: null,
        winnerId: null,
      };
      // chaîner les 2 matches du round précédent vers celui-ci
      prev[i * 2].nextMatchId = m.id;
      prev[i * 2 + 1].nextMatchId = m.id;
      nextRound.push(m);
      matches.push(m);
    }
    prev = nextRound;
  }

  // Propage les winners auto (byes)
  advanceAuto(matches);
  return matches;
}

/**
 * DOUBLE ELIMINATION — winners' bracket + losers' bracket + grande finale.
 * Implémentation simplifiée : marquée "bracket", chaînage winner + loser.
 */
export function generateDoubleElim(players: string[]): Match[] {
  const winners = generateSingleElim(players);
  winners.forEach((m) => (m.bracket = "winners"));

  const n = players.length;
  const size = nextPow2(n);
  const losers: Match[] = [];
  const grandFinal: Match = {
    id: uid("m"),
    round: Math.log2(size) + 1,
    position: 0,
    bracket: "finals",
    playerA: null,
    playerB: null,
    scoreA: null,
    scoreB: null,
    winnerId: null,
  };

  const wbFinal = winners.find(
    (m) => m.round === Math.log2(size) && !m.nextMatchId
  );
  if (wbFinal) wbFinal.nextMatchId = grandFinal.id;

  return [...winners, ...losers, grandFinal];
}

/**
 * SWISS — appariement par rang accumulé, sans rejouer.
 */
export function generateSwiss(players: string[], rounds: number = 0): Match[] {
  const nRounds = rounds || Math.ceil(Math.log2(Math.max(2, players.length)));
  if (players.length < 2) return [];

  const ps = shuffle(players);
  const matches: Match[] = [];

  for (let i = 0; i < Math.floor(ps.length / 2); i++) {
    matches.push({
      id: uid("m"),
      round: 1,
      position: i,
      playerA: ps[i * 2],
      playerB: ps[i * 2 + 1],
      scoreA: null,
      scoreB: null,
      winnerId: null,
    });
  }
  return matches;
}

export function advanceAuto(matches: Match[]): Match[] {
  matches.forEach((m) => {
    if (!m.winnerId || !m.nextMatchId) return;
    const next = matches.find((x) => x.id === m.nextMatchId);
    if (!next) return;
    if (next.playerA == null) next.playerA = m.winnerId;
    else if (next.playerB == null) next.playerB = m.winnerId;
    if (next.playerA && next.playerB == null && next.winnerId == null) {
      // attend l'autre demi
    }
  });
  return matches;
}

export function setMatchWinner(
  matches: Match[],
  matchId: string,
  winnerId: string | null
): Match[] {
  const next = matches.map((m) => ({ ...m }));
  const idx = next.findIndex((m) => m.id === matchId);
  if (idx < 0) return matches;
  next[idx].winnerId = winnerId;
  if (next[idx].nextMatchId) {
    const nm = next.find((x) => x.id === next[idx].nextMatchId);
    if (nm) {
      if (nm.playerA && nm.playerA === next[idx].playerA) nm.playerA = winnerId;
      else if (nm.playerB && nm.playerB === next[idx].playerA)
        nm.playerB = winnerId;
      else if (nm.playerA && nm.playerA === next[idx].playerB)
        nm.playerA = winnerId;
      else if (nm.playerB && nm.playerB === next[idx].playerB)
        nm.playerB = winnerId;
      else if (nm.playerA == null) nm.playerA = winnerId;
      else if (nm.playerB == null) nm.playerB = winnerId;
    }
  }
  return next;
}

export function rankingFromMatches(
  matches: Match[],
  players: string[],
  format: GameFormat
): { playerId: string; rank: number }[] {
  if (format === "round_robin" || format === "swiss") {
    const wins: Record<string, number> = {};
    players.forEach((p) => (wins[p] = 0));
    matches.forEach((m) => {
      if (m.winnerId) wins[m.winnerId] = (wins[m.winnerId] || 0) + 1;
    });
    const sorted = [...players].sort((a, b) => (wins[b] || 0) - (wins[a] || 0));
    return sorted.map((p, i) => ({ playerId: p, rank: i + 1 }));
  }

  if (format === "single_elim" || format === "double_elim") {
    const maxRound = Math.max(...matches.map((m) => m.round));
    const final = matches.find((m) => m.round === maxRound);
    const ranks: Record<string, number> = {};

    if (final?.winnerId) ranks[final.winnerId] = 1;
    if (final && final.playerA && final.playerB && final.winnerId) {
      const loser =
        final.winnerId === final.playerA ? final.playerB : final.playerA;
      if (loser) ranks[loser] = 2;
    }
    matches.forEach((m) => {
      if (m.round === maxRound) return;
      if (!m.winnerId || !m.playerA || !m.playerB) return;
      const loser = m.winnerId === m.playerA ? m.playerB : m.playerA;
      if (!loser || ranks[loser]) return;
      ranks[loser] = Math.pow(2, maxRound - m.round) + 1;
    });

    const sorted = [...players].sort((a, b) => {
      const ra = ranks[a] ?? 999;
      const rb = ranks[b] ?? 999;
      return ra - rb;
    });
    return sorted.map((p, i) => ({
      playerId: p,
      rank: ranks[p] ?? i + 1,
    }));
  }

  return [];
}

/** Labels lisibles pour l'UI */
export const FORMAT_LABELS: Record<GameFormat, string> = {
  ranked: "Classement par rang (tout le monde joue)",
  round_robin: "Round-robin (chacun affronte chacun)",
  single_elim: "Élimination directe",
  double_elim: "Double élimination",
  swiss: "Système suisse",
};

export const FORMAT_DESCRIPTIONS: Record<GameFormat, string> = {
  ranked:
    "Tout le monde joue ensemble. Tu saisis le rang de chacun à la fin. Idéal pour Mario Kart, Just Dance, Quiz.",
  round_robin:
    "Chaque joueur affronte tous les autres. Le mieux pour les jeux 1v1 (FIFA, Smash).",
  single_elim:
    "Bracket classique. Tu perds → tu sors. Court, dramatique, lisible.",
  double_elim:
    "Bracket à deux chances. Tu perds une fois → tu vas dans le losers' bracket. (Bêta)",
  swiss: "Appariement par score à chaque round. Pas d'élimination. (Bêta)",
};
