import { describe, it, expect } from "vitest";
import {
  generateRoundRobin,
  generateSingleElim,
  rankingFromMatches,
  setMatchWinner,
} from "./formats";

describe("generateRoundRobin", () => {
  it("creates n*(n-1)/2 matches for even n", () => {
    const m = generateRoundRobin(["a", "b", "c", "d"]);
    expect(m).toHaveLength(6);
  });

  it("each player plays each other exactly once", () => {
    const players = ["a", "b", "c", "d"];
    const matches = generateRoundRobin(players);
    const pairs = new Set<string>();
    matches.forEach((m) => {
      const key = [m.playerA, m.playerB].sort().join("-");
      pairs.add(key);
    });
    expect(pairs.size).toBe(6);
  });

  it("handles odd number of players with byes", () => {
    const m = generateRoundRobin(["a", "b", "c"]);
    expect(m).toHaveLength(3);
  });

  it("returns empty for less than 2 players", () => {
    expect(generateRoundRobin([])).toEqual([]);
    expect(generateRoundRobin(["a"])).toEqual([]);
  });
});

describe("generateSingleElim", () => {
  it("creates correct number of matches for 8 players (power of 2)", () => {
    const m = generateSingleElim(["a", "b", "c", "d", "e", "f", "g", "h"]);
    expect(m).toHaveLength(7);
  });

  it("creates correct number of matches for 6 players (with byes)", () => {
    const m = generateSingleElim(["a", "b", "c", "d", "e", "f"]);
    expect(m).toHaveLength(7);
  });

  it("auto-advances byes in round 1", () => {
    const m = generateSingleElim(["a", "b", "c", "d", "e"]);
    const round1 = m.filter((x) => x.round === 1);
    const autoAdvanced = round1.filter((x) => x.winnerId != null);
    expect(autoAdvanced.length).toBeGreaterThan(0);
  });

  it("chains rounds together via nextMatchId", () => {
    const m = generateSingleElim(["a", "b", "c", "d"]);
    const round1 = m.filter((x) => x.round === 1);
    expect(round1[0].nextMatchId).toBeDefined();
    expect(round1[1].nextMatchId).toBe(round1[0].nextMatchId);
  });

  it("returns empty for less than 2 players", () => {
    expect(generateSingleElim(["a"])).toEqual([]);
  });
});

describe("setMatchWinner", () => {
  it("propagates the winner to the next match", () => {
    const matches = generateSingleElim(["a", "b", "c", "d"]);
    const round1 = matches.filter((m) => m.round === 1);
    const updated = setMatchWinner(matches, round1[0].id, "a");
    const r1 = updated.find((m) => m.id === round1[0].id);
    const r2 = updated.find((m) => m.id === round1[0].nextMatchId);
    expect(r1?.winnerId).toBe("a");
    expect([r2?.playerA, r2?.playerB]).toContain("a");
  });
});

describe("rankingFromMatches", () => {
  it("computes round_robin ranking by win count", () => {
    const matches = [
      { id: "m1", round: 1, position: 0, playerA: "a", playerB: "b", scoreA: null, scoreB: null, winnerId: "a" },
      { id: "m2", round: 1, position: 1, playerA: "a", playerB: "c", scoreA: null, scoreB: null, winnerId: "a" },
      { id: "m3", round: 1, position: 2, playerA: "b", playerB: "c", scoreA: null, scoreB: null, winnerId: "b" },
    ];
    const r = rankingFromMatches(matches, ["a", "b", "c"], "round_robin");
    expect(r[0]).toMatchObject({ playerId: "a", rank: 1 });
    expect(r[1]).toMatchObject({ playerId: "b", rank: 2 });
  });

  it("computes single_elim ranking: champion + finalist + semis", () => {
    const m1 = { id: "m1", round: 1, position: 0, playerA: "a", playerB: "b", scoreA: null, scoreB: null, winnerId: "a", nextMatchId: "m3" };
    const m2 = { id: "m2", round: 1, position: 1, playerA: "c", playerB: "d", scoreA: null, scoreB: null, winnerId: "c", nextMatchId: "m3" };
    const m3 = { id: "m3", round: 2, position: 0, playerA: "a", playerB: "c", scoreA: null, scoreB: null, winnerId: "a" };
    const r = rankingFromMatches([m1, m2, m3], ["a", "b", "c", "d"], "single_elim");
    expect(r.find((x) => x.playerId === "a")?.rank).toBe(1);
    expect(r.find((x) => x.playerId === "c")?.rank).toBe(2);
  });
});
