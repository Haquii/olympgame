export const DEFAULT_POINTS = [
  { rank: 1, points: 10 },
  { rank: 2, points: 7 },
  { rank: 3, points: 5 },
  { rank: 4, points: 3 },
  { rank: 5, points: 2 },
  { rank: 6, points: 1 },
];

export const POPULAR_GAMES: { name: string; emoji: string }[] = [
  { name: "Mario Kart", emoji: "🏎️" },
  { name: "Super Smash Bros", emoji: "⚔️" },
  { name: "FIFA", emoji: "⚽" },
  { name: "Rocket League", emoji: "🚗" },
  { name: "Fortnite", emoji: "🛡️" },
  { name: "Valorant", emoji: "🎯" },
  { name: "League of Legends", emoji: "🧙" },
  { name: "Just Dance", emoji: "💃" },
  { name: "Mario Party", emoji: "🎲" },
  { name: "Trackmania", emoji: "🏁" },
  { name: "Tetris", emoji: "🧩" },
  { name: "Quiz", emoji: "🧠" },
]

export const AVATAR_COLORS = [
  "#0085C7",
  "#DF0024",
  "#009F3D",
  "#F4C300",
  "#7C3AED",
  "#EC4899",
  "#0EA5E9",
  "#0A1F2E",
];

export const BANNER_EMOJIS = [
  "🏆",
  "🎮",
  "🏅",
  "⚡",
  "🔥",
  "🎯",
  "🏖️",
  "❄️",
  "🌟",
  "👑",
];

export function uid(prefix = "id"): string {
  return prefix + "_" + Math.random().toString(36).slice(2, 10);
}

export function fmtDate(s: string | number | Date | null | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function pickColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}
