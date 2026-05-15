"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useHasHydrated, useStore } from "@/lib/store";
import { computeRanking, tournamentProgress } from "@/lib/ranking";

/**
 * Mode "écran TV" plein écran.
 * Cycle automatique entre podium / dernier match / classement / progression.
 */
export default function LivePage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHasHydrated();
  const t = useStore((s) =>
    s.tournaments.find((x) => x.id === (params?.id as string)) ?? null
  );
  const users = useStore((s) => s.users);
  const [view, setView] = useState<"podium" | "ranking" | "progress">("podium");

  useEffect(() => {
    const interval = setInterval(() => {
      setView((v) => v === "podium" ? "ranking" : v === "ranking" ? "progress" : "podium");
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!hydrated || !t) return null;

  const ranking = computeRanking(t);
  const progress = tournamentProgress(t);
  const top3 = ranking.slice(0, 3);

  return (
    <div
      className="fixed inset-0 bg-grad-hero text-white overflow-hidden flex flex-col"
      style={{
        backgroundImage: "radial-gradient(circle at 20% 80%,rgba(244,195,0,.25) 0,transparent 40%),radial-gradient(circle at 80% 20%,rgba(223,0,36,.18) 0,transparent 40%),linear-gradient(135deg,#0A1F2E 0%,#0085C7 60%,#F4C300 130%)",
      }}
    >
      <header className="flex justify-between items-center px-10 pt-8">
        <div>
          <div className="text-[14px] uppercase tracking-[3px] opacity-70">🔴 Live · Olymp&apos;Game</div>
          <h1 className="font-display text-[64px] leading-none tracking-wider mt-2">{t.bannerEmoji} {t.name}</h1>
        </div>
        <div className="text-right">
          <div className="text-[13px] uppercase tracking-wider opacity-70">{view === "podium" ? "Podium" : view === "ranking" ? "Classement" : "Progression"}</div>
          <Link href={`/tournois/${t.id}`} className="text-xs opacity-50 hover:opacity-100">↪ retour</Link>
        </div>
      </header>

      <div className="flex-1 grid place-items-center px-10">
        {view === "podium" && top3.length > 0 && top3[0].points > 0 && (<PodiumBig top3={top3} users={users} />)}
        {view === "podium" && (top3.length === 0 || top3[0].points === 0) && (
          <div className="text-center">
            <div className="text-[120px]">🎬</div>
            <div className="font-display text-[40px]">En attente des premiers résultats</div>
          </div>
        )}

        {view === "ranking" && (
          <div className="w-full max-w-[800px] flex flex-col gap-3">
            {ranking.slice(0, 8).map((r, i) => {
              const u = users.find((x) => x.id === r.playerId);
              if (!u) return null;
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
              return (
                <div key={r.playerId} className="grid grid-cols-[80px_1fr_auto] items-center gap-5 bg-white/10 border border-white/20 rounded-xl px-5 py-3 backdrop-blur-md">
                  <div className="font-display text-[40px] text-center">{medal}</div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full grid place-items-center font-bold text-2xl" style={{ backgroundColor: u.color }}>{u.avatar}</div>
                    <div className="font-display text-[32px] tracking-wider">{u.name}</div>
                  </div>
                  <div className="font-display text-[40px] text-oly-yellow">{r.points}<span className="text-base opacity-70 ml-2">pts</span></div>
                </div>
              );
            })}
          </div>
        )}

        {view === "progress" && (
          <div className="w-full max-w-[760px] text-center">
            <div className="font-display text-[200px] leading-none">{progress}<span className="text-[80px] text-oly-yellow">%</span></div>
            <div className="text-2xl opacity-80 mb-10">
              {t.games.filter((g) => {
                const f = g.format ?? "ranked";
                return f === "ranked" ? g.results.length > 0 : g.matches?.some((m) => m.winnerId);
              }).length}{" "}/ {t.games.length} jeux disputés
            </div>
            <div className="h-6 bg-white/10 rounded-full overflow-hidden border border-white/20">
              <div className="h-full bg-gradient-to-r from-oly-blue via-oly-green to-oly-yellow transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      <footer className="px-10 pb-8 flex justify-between items-center opacity-75 text-sm">
        <span>{t.players.length} joueurs · {t.games.length} jeux</span>
        <span className="opacity-50">olympgame.app</span>
      </footer>
    </div>
  );
}

function PodiumBig({ top3, users }: { top3: ReturnType<typeof computeRanking>; users: ReturnType<typeof useStore.getState>["users"] }) {
  const getU = (id: string) => users.find((u) => u.id === id);
  const a = getU(top3[0]?.playerId);
  const b = getU(top3[1]?.playerId);
  const c = getU(top3[2]?.playerId);

  return (
    <div className="grid grid-cols-3 gap-8 items-end max-w-[900px]">
      <Step height={280} emoji="🥈" user={b} points={top3[1]?.points ?? 0} rank={2} bg="from-slate-200 to-slate-500" />
      <Step height={360} emoji="🥇" user={a} points={top3[0]?.points ?? 0} rank={1} bg="from-yellow-200 to-yellow-500" scale />
      <Step height={220} emoji="🥉" user={c} points={top3[2]?.points ?? 0} rank={3} bg="from-orange-300 to-orange-700" />
    </div>
  );
}

function Step({ height, emoji, user, points, rank, bg, scale }: { height: number; emoji: string; user: { name: string; color: string; avatar: string } | null | undefined; points: number; rank: number; bg: string; scale?: boolean }) {
  if (!user) return (<div className={`bg-gradient-to-b ${bg} rounded-2xl p-4 text-center`} style={{ height }} />);
  return (
    <div className={`bg-gradient-to-b ${bg} rounded-2xl p-6 text-center flex flex-col items-center justify-end ${scale ? "scale-105 shadow-pop" : ""}`} style={{ height }}>
      <div className="text-[80px] leading-none mb-3">{emoji}</div>
      <div className="w-20 h-20 rounded-full grid place-items-center font-bold text-3xl text-white mb-3 border-4 border-white" style={{ backgroundColor: user.color }}>{user.avatar}</div>
      <div className="font-display text-[32px] text-ink leading-tight">{user.name}</div>
      <div className="font-display text-[40px] text-ink">{points} pts</div>
    </div>
  );
}
