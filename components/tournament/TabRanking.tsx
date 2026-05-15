"use client";

import { useStore } from "@/lib/store";
import { computeRanking } from "@/lib/ranking";
import RankRow from "@/components/RankRow";
import Empty from "@/components/Empty";
import type { Tournament } from "@/lib/types";

export default function TabRanking({ t }: { t: Tournament }) {
  const users = useStore((s) => s.users);
  const ranking = computeRanking(t);
  if (ranking.length === 0)
    return <Empty icon="🏆" title="Pas encore de classement"><p>Les joueurs s&apos;inscrivent encore.</p></Empty>;
  return (
    <div className="flex flex-col gap-2">
      {ranking.map((r, i) => (
        <RankRow key={r.playerId} entry={r} position={i + 1} user={users.find((u) => u.id === r.playerId) ?? null} />
      ))}
    </div>
  );
}
