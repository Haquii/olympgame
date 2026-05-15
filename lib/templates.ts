import { DEFAULT_POINTS, uid } from "./utils";
import type { Game, GameFormat } from "./types";

export type TournamentTemplate = {
  id: string;
  name: string;
  description: string;
  bannerEmoji: string;
  estimatedDuration: string;
  bestFor: string;
  games: Omit<Game, "id" | "results" | "matches">[];
};

function game(
  name: string,
  emoji: string,
  format: GameFormat = "ranked",
  points = DEFAULT_POINTS
): Omit<Game, "id" | "results" | "matches"> {
  return { name, emoji, format, pointsSystem: points };
}

export const TEMPLATES: TournamentTemplate[] = [
  {
    id: "mario_party_night",
    name: "Soirée Mario Party",
    description: "L'incontournable. Mini-jeux multi pour 2-4 joueurs, ambiance garantie.",
    bannerEmoji: "🎲",
    estimatedDuration: "2-3 h",
    bestFor: "4-8 joueurs · canapé partagé",
    games: [
      game("Mario Party - Plateau 1", "🎲"),
      game("Mario Party - Plateau 2", "🎲"),
      game("Mini-jeux - Tournoi rapide", "🎮"),
    ],
  },
  {
    id: "fifa_cup",
    name: "FIFA Cup",
    description: "Tournoi 1v1 en élimination directe. Le ballon d'or vous attend.",
    bannerEmoji: "⚽",
    estimatedDuration: "1-2 h",
    bestFor: "4-16 joueurs · matchs 1v1",
    games: [game("FIFA - Phase finale", "⚽", "single_elim")],
  },
  {
    id: "olympiades_ete",
    name: "Olympiades d'Été",
    description: "Multi-jeux, l'esprit olympique. Médailles à la clé.",
    bannerEmoji: "🏖️",
    estimatedDuration: "Soirée entière",
    bestFor: "6-12 joueurs · ambiance compet'",
    games: [
      game("Mario Kart", "🏎️"),
      game("FIFA", "⚽"),
      game("Just Dance", "💃"),
      game("Quiz Culture Geek", "🧠", "ranked", [
        { rank: 1, points: 15 }, { rank: 2, points: 10 }, { rank: 3, points: 7 },
        { rank: 4, points: 5 }, { rank: 5, points: 3 }, { rank: 6, points: 1 },
      ]),
    ],
  },
  {
    id: "smash_arena",
    name: "Smash Arena",
    description: "Tournoi 1v1 Smash en double élimination. Pas de fairplay.",
    bannerEmoji: "⚔️",
    estimatedDuration: "2-3 h",
    bestFor: "8-16 joueurs",
    games: [game("Super Smash Bros", "⚔️", "double_elim")],
  },
  {
    id: "rocket_league_3v3",
    name: "Rocket League 3v3",
    description: "Format équipes. À adapter selon l'effectif.",
    bannerEmoji: "🚗",
    estimatedDuration: "1-2 h",
    bestFor: "6-12 joueurs",
    games: [game("Match 1", "🚗"), game("Match 2", "🚗"), game("Match 3", "🚗")],
  },
  {
    id: "quiz_night",
    name: "Quiz Night",
    description: "Soirée culture geek / pop. Plusieurs manches, le mieux placé gagne.",
    bannerEmoji: "🧠",
    estimatedDuration: "1 h",
    bestFor: "n'importe quel nombre · pas besoin de console",
    games: [
      game("Quiz - Manche 1", "🧠", "ranked", [
        { rank: 1, points: 15 }, { rank: 2, points: 10 }, { rank: 3, points: 7 },
        { rank: 4, points: 5 }, { rank: 5, points: 3 }, { rank: 6, points: 1 },
      ]),
      game("Quiz - Manche 2", "🧠", "ranked", [
        { rank: 1, points: 15 }, { rank: 2, points: 10 }, { rank: 3, points: 7 },
        { rank: 4, points: 5 }, { rank: 5, points: 3 }, { rank: 6, points: 1 },
      ]),
    ],
  },
];

export function templateById(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}

/** Instancie les jeux d'un template (ajoute id, results vide, matches vide si non-ranked). */
export function instantiateTemplateGames(
  tpl: TournamentTemplate
): Game[] {
  return tpl.games.map((g) => ({
    ...g,
    id: uid("g"),
    results: [],
    matches: (g.format ?? "ranked") === "ranked" ? undefined : [],
  }));
}
