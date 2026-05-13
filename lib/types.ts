export type User = {
  id: string;
  name: string;
  avatar: string;
  color: string;
  joinedAt: number;
};

export type PointEntry = {
  rank: number;
  points: number;
};

export type GameResult = {
  playerId: string;
  rank: number;
};

export type Game = {
  id: string;
  name: string;
  emoji: string;
  pointsSystem: PointEntry[];
  results: GameResult[];
};

export type TournamentStatus = "open" | "in_progress" | "completed";

export type Tournament = {
  id: string;
  name: string;
  description: string;
  bannerEmoji: string;
  createdBy: string;
  organizers: string[];
  status: TournamentStatus;
  startDate: string;
  maxPlayers: number;
  players: string[];
  games: Game[];
  createdAt: number;
};

export type RankingEntry = {
  playerId: string;
  points: number;
  gamesPlayed: number;
  gold: number;
  silver: number;
  bronze: number;
};

export type AppState = {
  currentUserId: string | null;
  users: User[];
  tournaments: Tournament[];
};
