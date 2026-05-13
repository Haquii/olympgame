import clsx from "clsx";
import Avatar from "./Avatar";
import type { RankingEntry, User } from "@/lib/types";

export default function RankRow({
  entry,
  position,
  user,
}: {
  entry: RankingEntry;
  position: number;
  user: User | null;
}) {
  if (!user) return null;
  const medal =
    position === 1
      ? "🥇"
      : position === 2
      ? "🥈"
      : position === 3
      ? "🥉"
      : `#${position}`;
  const podiumClass =
    position === 1
      ? "bg-gradient-to-r from-yellow-200/40 to-white border-oly-yellow"
      : position === 2
      ? "bg-gradient-to-r from-slate-200/50 to-white border-silver"
      : position === 3
      ? "bg-gradient-to-r from-orange-200/30 to-white border-bronze"
      : "bg-white border-border";

  return (
    <div
      className={clsx(
        "grid grid-cols-[60px_1fr_auto] sm:grid-cols-[60px_1fr_auto] items-center gap-4 border rounded-xl px-4 py-3.5",
        podiumClass
      )}
    >
      <div
        className={clsx(
          "font-display text-3xl text-center",
          position === 1 && "text-gold",
          position === 2 && "text-slate-400",
          position === 3 && "text-bronze",
          position > 3 && "text-ink-mute"
        )}
      >
        {medal}
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <Avatar user={user} />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-[15px] truncate">{user.name}</span>
          <span className="text-xs text-ink-soft">
            {entry.gamesPlayed} jeu{entry.gamesPlayed > 1 ? "x" : ""} · 🥇
            {entry.gold} 🥈{entry.silver} 🥉{entry.bronze}
          </span>
        </div>
      </div>
      <div className="font-display text-[30px] text-oly-blue leading-none">
        {entry.points}
        <span className="text-xs text-ink-mute font-sans tracking-normal ml-1 font-medium">
          pts
        </span>
      </div>
    </div>
  );
}
