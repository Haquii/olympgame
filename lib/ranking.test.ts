import { describe, it, expect } from "vitest";
import { computeRanking, tournamentProgress } from "./ranking";
import type { Tournament } from "./types";
import { DEFAULT_POINTS } from "./utils";

function makeTournament(partial: Partial<Tournament> = {}): Tournament {
  return {
    id: "t",
    name: "Test",
    description: "",
    bannerEmoji: "🏆",
    createdBy: "u1",
    organizers: ["u1"],
    status: "open",
    startDate: "2026-01-01",
    maxPlayers: 8,
    players: ["u1", "u2", "u3", "u4"],
    games: [],
    createdAt: 0,
    ...partial,
  };
}

describe("computeRanking", () => {
  it("returns one entry per player even with no games", () => {
    const t = makeTournament();
    const r = computeRanking(t);
    expect(r).toHaveLength(4);
    expect(r.every((x) => x.points === 0)).toBe(true);
    expect(r.every((x) => x.gamesPlayed === 0)).toBe(true);
  });

  it("sums points across games using the game's pointsSystem", () => {
    const t = makeTournament({
      games: [
        {
          id: "g1", name: "Mario Kart", emoji: "🏎️",
          pointsSystem: [...DEFAULT_POINTS],
          results: [
            { playerId: "u1", rank: 1 }, { playerId: "u2", rank: 2 },
            { playerId: "u3", rank: 3 }, { playerId: "u4", rank: 4 },
          ],
        },
      ],
    });
    const r = computeRanking(t);
    expect(r[0]).toMatchObject({ playerId: "u1", points: 10, gold: 1 });
    expect(r[1]).toMatchObject({ playerId: "u2", points: 7, silver: 1 });
    expect(r[2]).toMatchObject({ playerId: "u3", points: 5, bronze: 1 });
    expect(r[3]).toMatchObject({ playerId: "u4", points: 3 });
  });

  it("respects per-game point systems independently", () => {
    const t = makeTournament({
      games: [
        { id: "g1", name: "Quiz", emoji: "🧠", pointsSystem: [ { rank: 1, points: 15 }, { rank: 2, points: 10 } ], results: [ { playerId: "u1", rank: 1 }, { playerId: "u2", rank: 2 } ] },
        { id: "g2", name: "FIFA", emoji: "⚽", pointsSystem: [...DEFAULT_POINTS], results: [ { playerId: "u2", rank: 1 }, { playerId: "u1", rank: 2 } ] },
      ],
    });
    const r = computeRanking(t);
    expect(r[0]).toMatchObject({ playerId: "u1", points: 22, gold: 1, silver: 1 });
    expect(r[1]).toMatchObject({ playerId: "u2", points: 20, gold: 1, silver: 1 });
  });

  it("applies olympic tie-breakers: gold > silver > bronze", () => {
    const t = makeTournament({
      games: [
        { id: "g1", name: "G1", emoji: "🎮", pointsSystem: [ { rank: 1, points: 10 }, { rank: 2, points: 8 }, { rank: 3, points: 6 } ], results: [ { playerId: "u1", rank: 1 }, { playerId: "u2", rank: 2 }, { playerId: "u3", rank: 3 } ] },
        { id: "g2", name: "G2", emoji: "🎮", pointsSystem: [ { rank: 1, points: 10 }, { rank: 2, points: 8 } ], results: [ { playerId: "u2", rank: 1 }, { playerId: "u1", rank: 2 } ] },
      ],
    });
    const r = computeRanking(t);
    expect(r[0].points).toBe(r[1].points);
    expect(r[0].gold).toBe(r[1].gold);
  });

  it("tie-breaker by gold count when points tied", () => {
    const t = makeTournament({
      games: [
        { id: "g1", name: "G1", emoji: "🎮", pointsSystem: [ { rank: 1, points: 10 }, { rank: 2, points: 5 } ], results: [ { playerId: "u1", rank: 1 }, { playerId: "u2", rank: 2 } ] },
        { id: "g2", name: "G2", emoji: "🎮", pointsSystem: [ { rank: 1, points: 10 }, { rank: 2, points: 5 } ], results: [ { playerId: "u2", rank: 1 }, { playerId: "u1", rank: 2 } ] },
        { id: "g3", name: "G3", emoji: "🎮", pointsSystem: [ { rank: 1, points: 5 }, { rank: 2, points: 5 } ], results: [ { playerId: "u2", rank: 2 } ] },
      ],
    });
    const r = computeRanking(t);
    expect(r[0].playerId).toBe("u2");
    expect(r[1].playerId).toBe("u1");
  });

  it("ignores results from players not in the roster", () => {
    const t = makeTournament({
      players: ["u1", "u2"],
      games: [
        { id: "g1", name: "G", emoji: "🎮", pointsSystem: [...DEFAULT_POINTS], results: [ { playerId: "u1", rank: 1 }, { playerId: "u_ghost", rank: 2 } ] },
      ],
    });
    const r = computeRanking(t);
    expect(r).toHaveLength(2);
    expect(r.find((x) => x.playerId === "u_ghost")).toBeUndefined();
  });
});

describe("tournamentProgress", () => {
  it("returns 0 for tournament with no games", () => {
    const t = makeTournament({ games: [] });
    expect(tournamentProgress(t)).toBe(0);
  });

  it("returns 0 when no games have results", () => {
    const t = makeTournament({
      games: [ { id: "g1", name: "G", emoji: "🎮", pointsSystem: [...DEFAULT_POINTS], results: [] } ],
    });
    expect(tournamentProgress(t)).toBe(0);
  });

  it("returns 100 when all games have results", () => {
    const t = makeTournament({
      games: [ { id: "g1", name: "G", emoji: "🎮", pointsSystem: [...DEFAULT_POINTS], results: [{ playerId: "u1", rank: 1 }] } ],
    });
    expect(tournamentProgress(t)).toBe(100);
  });

  it("rounds correctly for partial progress", () => {
    const t = makeTournament({
      games: [
        { id: "g1", name: "G", emoji: "🎮", pointsSystem: [], results: [{ playerId: "u1", rank: 1 }] },
        { id: "g2", name: "G", emoji: "🎮", pointsSystem: [], results: [] },
        { id: "g3", name: "G", emoji: "🎮", pointsSystem: [], results: [] },
      ],
    });
    expect(tournamentProgress(t)).toBe(33);
  });
});
