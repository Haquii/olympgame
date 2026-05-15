"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import StatusBadge from "./StatusBadge";
import Avatar from "./Avatar";
import { fmtDate } from "@/lib/utils";
import type { Tournament, User } from "@/lib/types";

export default function TournamentCard({ t }: { t: Tournament }) {
  const users = useStore((s) => s.users);
  const orgs = t.organizers.map((id) => users.find((u) => u.id === id)).filter((u): u is User => Boolean(u));

  return (
    <Link href={`/tournois/${t.id}`} className="card card-hover p-0 flex flex-col overflow-hidden">
      <div className="h-[120px] bg-grad-card grid place-items-center text-white text-[54px] relative">
        <span className="relative z-10">{t.bannerEmoji || "🏆"}</span>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(244,195,0,.3),transparent_60%)]" />
      </div>
      <div className="px-5 pb-5 flex flex-col gap-2.5 flex-1">
        <div className="mt-2.5"><StatusBadge status={t.status} /></div>
        <div className="font-display text-[24px] leading-tight">{t.name}</div>
        <p className="text-sm text-ink-soft line-clamp-2">{t.description}</p>
        <div className="flex flex-wrap gap-3.5 text-[13px] text-ink-soft mt-1">
          <span className="inline-flex items-center gap-1">🎮 {t.games.length} jeu{t.games.length > 1 ? "x" : ""}</span>
          <span className="inline-flex items-center gap-1">👥 {t.players.length}/{t.maxPlayers}</span>
          <span className="inline-flex items-center gap-1">📅 {fmtDate(t.startDate)}</span>
        </div>
        <div className="flex items-center gap-2.5 mt-auto pt-2">
          <div className="flex -space-x-2">{orgs.slice(0, 3).map((u) => (<Avatar key={u.id} user={u} size="sm" />))}</div>
          <span className="text-xs text-ink-mute truncate">Orga · {orgs.map((o) => o.name).join(", ")}</span>
        </div>
      </div>
    </Link>
  );
}
