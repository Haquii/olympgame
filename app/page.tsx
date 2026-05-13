"use client";

import Link from "next/link";
import { useStore, useHasHydrated } from "@/lib/store";
import { computeRanking } from "@/lib/ranking";
import TournamentCard from "@/components/TournamentCard";

const FEATURES = [
  {
    icon: "🎮",
    color: "bg-oly-blue/10 text-oly-blue",
    title: "1. Crée ton tournoi",
    text: "Nom, dates, jeux. Tu fixes les règles en 2 minutes.",
  },
  {
    icon: "🤝",
    color: "bg-oly-yellow/20 text-yellow-700",
    title: "2. Ajoute des co-orgas",
    text: "Partage la gestion avec des amis pour gérer scores et inscriptions ensemble.",
  },
  {
    icon: "🏆",
    color: "bg-oly-red/10 text-oly-red",
    title: "3. Configure les points",
    text: "Barème olympique par défaut ou totalement custom selon le jeu.",
  },
  {
    icon: "🥇",
    color: "bg-oly-green/10 text-oly-green",
    title: "4. Joue & couronne",
    text: "Saisis les résultats partie par partie, le classement se met à jour en direct.",
  },
];

export default function HomePage() {
  const hydrated = useHasHydrated();
  const tournaments = useStore((s) => s.tournaments);
  const users = useStore((s) => s.users);

  const live = tournaments.find((t) => t.status === "in_progress");
  const open = tournaments.filter((t) => t.status !== "completed").slice(0, 3);

  const liveRanking = live ? computeRanking(live).slice(0, 3) : [];
  const liveUsers = liveRanking.map((r) =>
    users.find((u) => u.id === r.playerId)
  );

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-grad-hero text-white pt-20 pb-24 mb-12">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%,rgba(244,195,0,.25) 0,transparent 40%),radial-gradient(circle at 80% 20%,rgba(223,0,36,.18) 0,transparent 40%),radial-gradient(circle at 50% 50%,rgba(0,159,61,.15) 0,transparent 60%)",
          }}
        />
        <div className="container-app relative z-10 grid lg:grid-cols-[1.3fr_1fr] gap-12 items-center">
          <div>
            <span className="badge bg-oly-yellow/20 text-yellow-200 border border-oly-yellow/40">
              🏅 Saison ouverte
            </span>
            <h1 className="font-display text-[54px] md:text-[72px] leading-[0.95] tracking-[1.5px] mt-3 mb-5">
              Les jeux,
              <br />
              la rivalité,
              <br />
              la <span className="text-oly-yellow">gloire.</span>
            </h1>
            <p className="text-lg opacity-90 max-w-[520px] mb-8">
              Crée un tournoi multi-jeux entre potes, invite tes co-organisateurs,
              choisis tes jeux et ton barème de points. Olymp&apos;Game gère le reste :
              inscriptions, classements et médailles.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/creer" className="btn btn-accent btn-lg">
                ⚡ Lancer un tournoi
              </Link>
              <Link
                href="/tournois"
                className="btn btn-lg text-white bg-white/10 border border-white/30 hover:bg-white/20"
              >
                Voir les tournois
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-[520px]">
              <Stat num={hydrated ? tournaments.length : 0} label="Tournois" />
              <Stat num={hydrated ? users.length : 0} label="Joueurs" />
              <Stat num={"100%"} label="Gratuit" />
            </div>
          </div>

          {/* Podium card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl2 p-7 rotate-2 shadow-pop">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="font-display text-2xl tracking-wider">🥇 Podium du jour</h3>
              <span className="badge bg-blue-100 text-blue-700">Live</span>
            </div>
            {live ? (
              <>
                <p className="text-sm opacity-90 mb-4">{live.name}</p>
                <div className="grid grid-cols-3 gap-2 items-end mt-3.5">
                  <PodiumStep
                    height={70}
                    medal="🥈"
                    name={liveUsers[1]?.name || "—"}
                    points={liveRanking[1]?.points || 0}
                    color="from-slate-200 to-slate-400 text-ink"
                  />
                  <PodiumStep
                    height={90}
                    medal="🥇"
                    name={liveUsers[0]?.name || "—"}
                    points={liveRanking[0]?.points || 0}
                    color="from-yellow-200 to-yellow-400 text-ink"
                  />
                  <PodiumStep
                    height={55}
                    medal="🥉"
                    name={liveUsers[2]?.name || "—"}
                    points={liveRanking[2]?.points || 0}
                    color="from-orange-300 to-orange-600 text-white"
                  />
                </div>
              </>
            ) : (
              <p className="text-sm opacity-80">Aucune compétition en cours.</p>
            )}
          </div>
        </div>
      </section>

      <div className="container-app">
        {/* Features */}
        <section className="mb-16">
          <header className="mb-6">
            <h2 className="font-display text-[38px] tracking-wider leading-none">
              Comment ça marche
            </h2>
            <p className="text-ink-soft text-[15px] mt-1.5">
              Quatre étapes, et que la compétition commence.
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="card">
                <div
                  className={`w-12 h-12 rounded-xl grid place-items-center text-2xl mb-3.5 ${f.color}`}
                >
                  {f.icon}
                </div>
                <h3 className="text-[17px] font-bold mb-1.5">{f.title}</h3>
                <p className="text-ink-soft text-sm">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open tournaments */}
        <section className="mb-16">
          <header className="flex justify-between items-end mb-6 gap-6 flex-wrap">
            <div>
              <h2 className="font-display text-[38px] tracking-wider leading-none">
                Tournois ouverts
              </h2>
              <p className="text-ink-soft text-[15px] mt-1.5">
                Rejoins une compétition en cours ou inscris-toi à venir.
              </p>
            </div>
            <Link href="/tournois" className="btn btn-ghost">
              Tous les tournois →
            </Link>
          </header>
          {hydrated && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {open.map((t) => (
                <TournamentCard key={t.id} t={t} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({ num, label }: { num: number | string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3.5 rounded-xl">
      <div className="font-display text-[32px] text-oly-yellow leading-none">
        {num}
      </div>
      <div className="text-[11px] uppercase tracking-wider opacity-85 mt-1">
        {label}
      </div>
    </div>
  );
}

function PodiumStep({
  height,
  medal,
  name,
  points,
  color,
}: {
  height: number;
  medal: string;
  name: string;
  points: number;
  color: string;
}) {
  return (
    <div
      className={`bg-gradient-to-b ${color} rounded-lg px-2 py-2.5 text-center font-bold`}
      style={{ height }}
    >
      <span className="block text-2xl mb-1">{medal}</span>
      <div className="text-[13px] leading-tight">{name}</div>
      <div className="text-[11px] opacity-80 font-medium">{points} pts</div>
    </div>
  );
}
