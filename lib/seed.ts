import type { AppState, User, Tournament } from "./types";
import { DEFAULT_POINTS, uid } from "./utils";

export function seedState(): AppState {
  const day = 86400000;
  const now = Date.now();

  const u1: User = { id: "u_baptiste", name: "Baptiste", avatar: "B", color: "#0085C7", joinedAt: now - day * 30 };
  const u2: User = { id: "u_lea", name: "Léa", avatar: "L", color: "#DF0024", joinedAt: now - day * 20 };
  const u3: User = { id: "u_thomas", name: "Thomas", avatar: "T", color: "#009F3D", joinedAt: now - day * 18 };
  const u4: User = { id: "u_camille", name: "Camille", avatar: "C", color: "#F4C300", joinedAt: now - day * 15 };
  const u5: User = { id: "u_julien", name: "Julien", avatar: "J", color: "#7C3AED", joinedAt: now - day * 12 };
  const u6: User = { id: "u_sara", name: "Sara", avatar: "S", color: "#EC4899", joinedAt: now - day * 10 };
  const u7: User = { id: "u_max", name: "Max", avatar: "M", color: "#0A1F2E", joinedAt: now - day * 8 };
  const u8: User = { id: "u_emma", name: "Emma", avatar: "E", color: "#0EA5E9", joinedAt: now - day * 5 };

  const t1: Tournament = {
    id: "t_ete2026",
    name: "Olympiades d'Été 2026",
    description: "La grande compétition multi-jeux entre potes pour fêter l'été. Six jeux, une couronne, beaucoup de chambrage.",
    bannerEmoji: "🏖️",
    createdBy: u1.id,
    organizers: [u1.id, u2.id],
    status: "in_progress",
    startDate: "2026-05-25",
    maxPlayers: 16,
    players: [u1.id, u2.id, u3.id, u4.id, u5.id, u6.id, u7.id, u8.id],
    games: [
      { id: uid("g"), name: "Mario Kart", emoji: "🏎️", pointsSystem: [...DEFAULT_POINTS], results: [
        { playerId: u4.id, rank: 1 }, { playerId: u1.id, rank: 2 }, { playerId: u3.id, rank: 3 }, { playerId: u2.id, rank: 4 },
        { playerId: u5.id, rank: 5 }, { playerId: u6.id, rank: 6 }, { playerId: u7.id, rank: 7 }, { playerId: u8.id, rank: 8 },
      ]},
      { id: uid("g"), name: "FIFA", emoji: "⚽", pointsSystem: [...DEFAULT_POINTS], results: [
        { playerId: u3.id, rank: 1 }, { playerId: u7.id, rank: 2 }, { playerId: u1.id, rank: 3 }, { playerId: u5.id, rank: 4 },
        { playerId: u4.id, rank: 5 }, { playerId: u2.id, rank: 6 }, { playerId: u8.id, rank: 7 }, { playerId: u6.id, rank: 8 },
      ]},
      { id: uid("g"), name: "Just Dance", emoji: "💃", pointsSystem: [...DEFAULT_POINTS], results: [
        { playerId: u6.id, rank: 1 }, { playerId: u2.id, rank: 2 }, { playerId: u8.id, rank: 3 }, { playerId: u4.id, rank: 4 },
        { playerId: u1.id, rank: 5 }, { playerId: u3.id, rank: 6 }, { playerId: u5.id, rank: 7 }, { playerId: u7.id, rank: 8 },
      ]},
      { id: uid("g"), name: "Smash Bros", emoji: "⚔️", pointsSystem: [...DEFAULT_POINTS], results: [] },
      { id: uid("g"), name: "Quiz Culture Geek", emoji: "🧠", pointsSystem: [
        { rank: 1, points: 15 }, { rank: 2, points: 10 }, { rank: 3, points: 7 }, { rank: 4, points: 5 }, { rank: 5, points: 3 }, { rank: 6, points: 1 },
      ], results: [] },
    ],
    createdAt: now - day * 7,
  };

  const t2: Tournament = {
    id: "t_mariokart",
    name: "Mario Kart Mondial",
    description: "Le tournoi 100% Mario Kart. Trois courses, le meilleur cumul gagne.",
    bannerEmoji: "🏎️",
    createdBy: u3.id,
    organizers: [u3.id],
    status: "open",
    startDate: "2026-06-08",
    maxPlayers: 12,
    players: [u3.id, u5.id, u1.id, u4.id],
    games: [
      { id: uid("g"), name: "Mario Kart - Course 1", emoji: "🏁", pointsSystem: [...DEFAULT_POINTS], results: [] },
      { id: uid("g"), name: "Mario Kart - Course 2", emoji: "🏁", pointsSystem: [...DEFAULT_POINTS], results: [] },
      { id: uid("g"), name: "Mario Kart - Course 3", emoji: "🏁", pointsSystem: [...DEFAULT_POINTS], results: [] },
    ],
    createdAt: now - day * 2,
  };

  const t3: Tournament = {
    id: "t_winter25",
    name: "Winter Cup",
    description: "L'édition hiver, déjà légendaire. Bravo aux médaillés.",
    bannerEmoji: "❄️",
    createdBy: u2.id,
    organizers: [u2.id, u4.id],
    status: "completed",
    startDate: "2026-01-15",
    maxPlayers: 10,
    players: [u1.id, u2.id, u3.id, u4.id, u5.id, u6.id],
    games: [
      { id: uid("g"), name: "Rocket League", emoji: "🚗", pointsSystem: [...DEFAULT_POINTS], results: [
        { playerId: u2.id, rank: 1 }, { playerId: u5.id, rank: 2 }, { playerId: u1.id, rank: 3 }, { playerId: u4.id, rank: 4 }, { playerId: u3.id, rank: 5 }, { playerId: u6.id, rank: 6 },
      ]},
      { id: uid("g"), name: "Tetris 99", emoji: "🧩", pointsSystem: [...DEFAULT_POINTS], results: [
        { playerId: u1.id, rank: 1 }, { playerId: u2.id, rank: 2 }, { playerId: u6.id, rank: 3 }, { playerId: u3.id, rank: 4 }, { playerId: u4.id, rank: 5 }, { playerId: u5.id, rank: 6 },
      ]},
      { id: uid("g"), name: "Trackmania", emoji: "🏁", pointsSystem: [...DEFAULT_POINTS], results: [
        { playerId: u5.id, rank: 1 }, { playerId: u1.id, rank: 2 }, { playerId: u2.id, rank: 3 }, { playerId: u3.id, rank: 4 }, { playerId: u6.id, rank: 5 }, { playerId: u4.id, rank: 6 },
      ]},
    ],
    createdAt: now - day * 120,
  };

  return { currentUserId: u1.id, users: [u1, u2, u3, u4, u5, u6, u7, u8], tournaments: [t1, t2, t3] };
}
