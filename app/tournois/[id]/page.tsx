"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import clsx from "clsx";
import { toast, useStore, useHasHydrated } from "@/lib/store";
import StatusBadge from "@/components/StatusBadge";
import Empty from "@/components/Empty";
import TabApercu from "@/components/tournament/TabApercu";
import TabRanking from "@/components/tournament/TabRanking";
import TabGames from "@/components/tournament/TabGames";
import TabPlayers from "@/components/tournament/TabPlayers";
import TabOrga from "@/components/tournament/TabOrga";
import { fmtDate } from "@/lib/utils";

type TabKey = "apercu" | "classement" | "jeux" | "joueurs" | "orga";

export default function TournoiDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const hydrated = useHasHydrated();
  const t = useStore((s) => s.tournaments.find((x) => x.id === id) ?? null);
  const me = useStore((s) => s.currentUserId);
  const joinTournament = useStore((s) => s.joinTournament);
  const leaveTournament = useStore((s) => s.leaveTournament);
  const [tab, setTab] = useState<TabKey>("apercu");

  if (!hydrated) return null;
  if (!t)
    return (
      <div className="container-app pt-12">
        <Empty icon="🤷" title="Tournoi introuvable">
          <Link href="/tournois" className="btn btn-primary mt-4">
            Voir les tournois
          </Link>
        </Empty>
      </div>
    );

  const iAmIn = me ? t.players.includes(me) : false;
  const iAmOrga = me ? t.organizers.includes(me) : false;

  const TABS: { k: TabKey; label: string }[] = [
    { k: "apercu", label: "Aperçu" },
    { k: "classement", label: "🏆 Classement" },
    { k: "jeux", label: "🎮 Jeux & Points" },
    { k: "joueurs", label: "👥 Joueurs" },
    ...(iAmOrga ? [{ k: "orga" as const, label: "⚙️ Organisation" }] : []),
  ];

  return (
    <div className="container-app pt-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-grad-hero text-white rounded-xl2 p-7 sm:p-8 mb-7">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 90% 20%,rgba(244,195,0,.25),transparent 50%)",
          }}
        />
        <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 items-center">
          <div className="text-[72px] leading-none">{t.bannerEmoji || "🏆"}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={t.status} />
              {iAmOrga && (
                <span className="badge bg-yellow-100 text-yellow-800">
                  ⚙️ Organisateur
                </span>
              )}
            </div>
            <h1 className="font-display text-[40px] sm:text-[48px] tracking-wider leading-none mb-2">
              {t.name}
            </h1>
            <p className="opacity-90 max-w-[600px]">{t.description}</p>
            <div className="flex gap-5 mt-3 flex-wrap">
              <Stat label="Joueurs" value={`${t.players.length}/${t.maxPlayers}`} />
              <Stat label={`Jeu${t.games.length > 1 ? "x" : ""}`} value={t.games.length} />
              <Stat label="Début" value={fmtDate(t.startDate)} />
            </div>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            {t.status !== "completed" &&
              !iAmIn &&
              t.players.length < t.maxPlayers &&
              me && (
                <button
                  onClick={() => {
                    joinTournament(t.id);
                    toast("Inscription confirmée ✅", "success");
                  }}
                  className="btn btn-accent"
                >
                  ⚡ Rejoindre
                </button>
              )}
            {iAmIn && t.status === "open" && t.createdBy !== me && (
              <button
                onClick={() => {
                  leaveTournament(t.id);
                  toast("Tu as quitté le tournoi");
                }}
                className="btn text-white bg-white/10 border border-white/30 hover:bg-white/20"
              >
                Quitter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {TABS.map((x) => (
          <button
            key={x.k}
            onClick={() => setTab(x.k)}
            className={clsx("tab", tab === x.k && "tab-active")}
          >
            {x.label}
          </button>
        ))}
      </div>

      {tab === "apercu" && <TabApercu t={t} />}
      {tab === "classement" && <TabRanking t={t} />}
      {tab === "jeux" && <TabGames t={t} canEdit={iAmOrga} />}
      {tab === "joueurs" && <TabPlayers t={t} canEdit={iAmOrga} />}
      {tab === "orga" && iAmOrga && <TabOrga t={t} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="font-display text-[26px] text-oly-yellow leading-none tracking-wider">
        {value}
      </div>
      <div className="text-[13px] opacity-85">{label}</div>
    </div>
  );
}
