"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore, useHasHydrated } from "@/lib/store";
import TournamentCard from "@/components/TournamentCard";
import Empty from "@/components/Empty";
import clsx from "clsx";
import type { TournamentStatus } from "@/lib/types";

type Filter = "all" | TournamentStatus;

const FILTERS: { k: Filter; label: string }[] = [
  { k: "all", label: "Tous" },
  { k: "open", label: "Inscriptions ouvertes" },
  { k: "in_progress", label: "En cours" },
  { k: "completed", label: "Terminés" },
];

export default function TournoisPage() {
  const hydrated = useHasHydrated();
  const tournaments = useStore((s) => s.tournaments);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () => tournaments.filter((t) => (filter === "all" ? true : t.status === filter)),
    [tournaments, filter]
  );

  return (
    <div className="container-app pt-8">
      <header className="flex justify-between items-end gap-6 flex-wrap mb-6">
        <div>
          <h2 className="font-display text-[38px] tracking-wider leading-none">Tous les tournois</h2>
          <p className="text-ink-soft text-[15px] mt-1.5">Trouve un tournoi à rejoindre, ou lance le tien.</p>
        </div>
        <Link href="/creer" className="btn btn-primary">+ Créer un tournoi</Link>
      </header>

      <div className="flex flex-wrap gap-2.5 mb-6">
        {FILTERS.map((f) => (
          <button key={f.k} onClick={() => setFilter(f.k)} className={clsx("filter-pill", filter === f.k && "filter-pill-active")}>
            {f.label}
          </button>
        ))}
      </div>

      {!hydrated ? null : filtered.length === 0 ? (
        <Empty title="Aucun tournoi ici">
          <p>Essaie un autre filtre, ou lance le tien.</p>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => (<TournamentCard key={t.id} t={t} />))}
        </div>
      )}
    </div>
  );
}
