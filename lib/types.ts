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

export type GameFormat =
  | "ranked"
  | "round_robin"
  | "single_elim"
  | "double_elim"
  | "swiss";

export type Match = {
  id: string;
  round: number;
  position: number;
  bracket?: "winners" | "losers" | "finals";
  playerA: string | null;
  playerB: string | null;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  nextMatchId?: string | null;
  nextLoserMatchId?: string | null;
};

export type Game = {
  id: string;
  name: string;
  emoji: string;
  pointsSystem: PointEntry[];
  results: GameResult[];
  format?: GameFormat;
  matches?: Match[];
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
