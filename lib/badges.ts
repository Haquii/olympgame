import type { AppState, Tournament, User } from "./types";
import { computeRanking } from "./ranking";

export type Badge = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
  progress?: { current: number; target: number };
};

/**
 * Calcule les badges d'un joueur d'après l'état global.
 * Tous les badges sont déterministes (recalculés à chaque affichage, pas de persistance).
 */
export function computeBadges(userId: string, state: AppState): Badge[] {
  const tournaments = state.tournaments;
  const playedIn = tournaments.filter((t) => t.players.includes(userId));
  const organized = tournaments.filter((t) => t.organizers.includes(userId));

  let totalGold = 0,
    totalSilver = 0,
    totalBronze = 0,
    totalPoints = 0,
    totalGames = 0;
  const tournamentsWon: Tournament[] = [];
  playedIn.forEach((t) => {
    const r = computeRanking(t).find((x) => x.playerId === userId);
    if (r) {
      totalGold += r.gold;
      totalSilver += r.silver;
      totalBronze += r.bronze;
      totalPoints += r.points;
      totalGames += r.gamesPlayed;
    }
    if (t.status === "completed") {
      const top = computeRanking(t)[0];
      if (top?.playerId === userId) tournamentsWon.push(t);
    }
  });

  return [
    { id: "first_steps", emoji: "🎮", name: "Premier pas", description: "Rejoindre ton premier tournoi", earned: playedIn.length >= 1, progress: { current: Math.min(playedIn.length, 1), target: 1 } },
    { id: "organizer", emoji: "🛡️", name: "Organisateur", description: "Organiser ton premier tournoi", earned: organized.length >= 1, progress: { current: Math.min(organized.length, 1), target: 1 } },
    { id: "gold_collector", emoji: "🥇", name: "Or olympique", description: "Décrocher 5 médailles d'or", earned: totalGold >= 5, progress: { current: Math.min(totalGold, 5), target: 5 } },
    { id: "podium_pro", emoji: "🏆", name: "Habitué du podium", description: "Monter sur le podium 10 fois (toutes médailles)", earned: totalGold + totalSilver + totalBronze >= 10, progress: { current: Math.min(totalGold + totalSilver + totalBronze, 10), target: 10 } },
    { id: "tournament_winner", emoji: "👑", name: "Champion absolu", description: "Gagner un tournoi complet", earned: tournamentsWon.length >= 1, progress: { current: Math.min(tournamentsWon.length, 1), target: 1 } },
    { id: "veteran", emoji: "🎖️", name: "Vétéran", description: "Jouer 25 matchs", earned: totalGames >= 25, progress: { current: Math.min(totalGames, 25), target: 25 } },
    { id: "century", emoji: "💯", name: "Centurion", description: "Cumuler 100 points", earned: totalPoints >= 100, progress: { current: Math.min(totalPoints, 100), target: 100 } },
    { id: "host", emoji: "🎤", name: "Maître de cérémonie", description: "Organiser 5 tournois", earned: organized.length >= 5, progress: { current: Math.min(organized.length, 5), target: 5 } },
    { id: "social", emoji: "🤝", name: "Esprit Olympique", description: "Participer à 3 tournois", earned: playedIn.length >= 3, progress: { current: Math.min(playedIn.length, 3), target: 3 } },
    { id: "legend", emoji: "⭐", name: "Légende", description: "Gagner 3 tournois", earned: tournamentsWon.length >= 3, progress: { current: Math.min(tournamentsWon.length, 3), target: 3 } },
  ];
}
