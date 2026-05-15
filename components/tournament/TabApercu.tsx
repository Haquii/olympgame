"use client";

import { useStore } from "@/lib/store";
import { computeRanking, tournamentProgress } from "@/lib/ranking";
import Avatar from "@/components/Avatar";
import RankRow from "@/components/RankRow";
import type { Tournament } from "@/lib/types";

export default function TabApercu({ t }: { t: Tournament }) {
  const users = useStore((s) => s.users);
  const orgs = t.organizers.map((id) => users.find((u) => u.id === id)).filter(Boolean);
  const ranking = computeRanking(t);
  const top3 = ranking.slice(0, 3);
  const progress = tournamentProgress(t);
  const gamesPlayed = t.games.filter((g) => g.results.length > 0).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="card">
        <h3 className="font-display text-[22px] mb-3">🏅 Podium actuel</h3>
        {top3.length === 0 || top3[0].points === 0 ? (
          <p className="text-ink-soft">Aucun résultat enregistré.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {top3.map((r, i) => (
              <RankRow key={r.playerId} entry={r} position={i + 1} user={users.find((u) => u.id === r.playerId) ?? null} />
            ))}
          </div>
        )}
      </div>
      <div className="card">
        <h3 className="font-display text-[22px] mb-3">📊 Progression</h3>
        <div className="flex justify-between items-center text-sm mb-2">
          <span>{gamesPlayed} / {t.games.length} jeux disputés</span>
          <strong>{progress}%</strong>
        </div>
        <div className="h-2.5 bg-surface-alt rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-oly-blue to-oly-yellow transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="divider" />
        <h4 className="font-bold text-sm mb-2.5">Organisateurs</h4>
        <div className="flex flex-wrap gap-2">
          {orgs.map((u) => u ? (
            <div key={u.id} className="inline-flex items-center gap-2 bg-surface-alt rounded-full pl-1 pr-3 py-1 text-[13px]">
              <Avatar user={u} size="sm" />
              <span>{u.name}</span>
            </div>
          ) : null)}
        </div>
      </div>
    </div>
  );
}
