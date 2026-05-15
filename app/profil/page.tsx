"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, useHasHydrated, useStore } from "@/lib/store";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";
import TournamentCard from "@/components/TournamentCard";
import Empty from "@/components/Empty";
import { computeRanking } from "@/lib/ranking";
import { computeBadges } from "@/lib/badges";
import { fmtDate } from "@/lib/utils";

export default function ProfilPage() {
  const router = useRouter();
  const hydrated = useHasHydrated();
  const me = useStore((s) => s.currentUserId ? s.users.find((u) => u.id === s.currentUserId) ?? null : null);
  const tournaments = useStore((s) => s.tournaments);
  const signUp = useStore((s) => s.signUp);
  const reset = useStore((s) => s.reset);

  const [name, setName] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  if (!hydrated) return null;

  if (!me) {
    return (
      <div className="container-app pt-12 max-w-[480px]">
        <div className="card p-7">
          <h2 className="font-display text-[38px]">Rejoindre Olymp&apos;Game</h2>
          <p className="text-ink-soft mb-5">Crée ton profil pour rejoindre ou organiser des tournois.</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5">Pseudo</label>
              <input
                className="field-input"
                placeholder="Ton pseudo de gamer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (!name.trim()) return toast("Choisis un pseudo", "error");
                    signUp(name.trim());
                    toast(`Bienvenue ${name.trim()} 🏆`, "success");
                  }
                }}
              />
            </div>
          </div>
          <button
            onClick={() => {
              if (!name.trim()) return toast("Choisis un pseudo", "error");
              signUp(name.trim());
              toast(`Bienvenue ${name.trim()} 🏆`, "success");
            }}
            className="btn btn-primary btn-block mt-5"
          >
            Créer mon profil
          </button>
        </div>
      </div>
    );
  }

  const myTournaments = tournaments.filter((t) => t.players.includes(me.id));
  const myOrganized = tournaments.filter((t) => t.organizers.includes(me.id));

  let totalPoints = 0, totalGold = 0, totalSilver = 0, totalBronze = 0;
  myTournaments.forEach((t) => {
    const r = computeRanking(t).find((x) => x.playerId === me.id);
    if (r) {
      totalPoints += r.points;
      totalGold += r.gold;
      totalSilver += r.silver;
      totalBronze += r.bronze;
    }
  });

  return (
    <div className="container-app pt-8">
      <div className="card p-7 bg-grad-hero text-white border-0 mb-6 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-5 items-center">
        <Avatar user={me} size="lg" />
        <div>
          <h1 className="font-display text-[40px] tracking-wider leading-none">{me.name}</h1>
          <p className="text-sm opacity-85 mt-1">Membre depuis {fmtDate(me.joinedAt)}</p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <button onClick={() => setEditOpen(true)} className="btn text-white bg-white/15 border border-white/30 hover:bg-white/25 btn-sm">✏️ Modifier</button>
          <button onClick={() => { if (!confirm("Réinitialiser toutes les données ?")) return; reset(); toast("Données réinitialisées", "success"); }} className="btn text-white/80 bg-white/5 border border-white/20 hover:bg-white/10 btn-sm">🔄 Reset démo</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        <Stat value={totalPoints} label="Points cumulés" color="text-oly-blue" />
        <Stat value={`🥇 ${totalGold}`} label="Médailles d'or" color="text-gold" />
        <Stat value={`🥈 ${totalSilver}`} label="Médailles d'argent" color="text-slate-400" />
        <Stat value={`🥉 ${totalBronze}`} label="Médailles de bronze" color="text-bronze" />
      </div>

      <section className="mb-10">
        <h2 className="font-display text-[30px] tracking-wider leading-none mb-4">🏆 Mes badges</h2>
        <BadgesGrid userId={me.id} />
      </section>

      <section className="mb-10">
        <h2 className="font-display text-[30px] tracking-wider leading-none mb-4">Mes tournois ({myTournaments.length})</h2>
        {myTournaments.length === 0 ? (
          <Empty icon="🎮" title="Aucun tournoi rejoint"><button onClick={() => router.push("/tournois")} className="btn btn-primary mt-4">Trouver un tournoi</button></Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{myTournaments.map((t) => (<TournamentCard key={t.id} t={t} />))}</div>
        )}
      </section>

      <section>
        <h2 className="font-display text-[30px] tracking-wider leading-none mb-4">Tournois que j&apos;organise ({myOrganized.length})</h2>
        {myOrganized.length === 0 ? (
          <Empty icon="⚙️" title="Tu n'organises encore rien"><button onClick={() => router.push("/creer")} className="btn btn-primary mt-4">Lancer un tournoi</button></Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{myOrganized.map((t) => (<TournamentCard key={t.id} t={t} />))}</div>
        )}
      </section>

      {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
    </div>
  );
}

function Stat({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="card text-center">
      <div className={`font-display text-[36px] leading-none ${color}`}>{value}</div>
      <div className="text-xs text-ink-mute uppercase tracking-wider mt-1.5">{label}</div>
    </div>
  );
}

function BadgesGrid({ userId }: { userId: string }) {
  const state = useStore((s) => ({ currentUserId: s.currentUserId, users: s.users, tournaments: s.tournaments }));
  const badges = computeBadges(userId, state);
  const earned = badges.filter((b) => b.earned).length;
  return (
    <>
      <p className="text-ink-soft text-sm mb-4">{earned} / {badges.length} badges débloqués</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {badges.map((b) => (
          <div key={b.id} className={`card text-center transition-all ${b.earned ? "" : "opacity-40 grayscale"}`}>
            <div className="text-[44px] leading-none mb-2">{b.emoji}</div>
            <div className="font-bold text-sm">{b.name}</div>
            <div className="text-xs text-ink-mute mt-1 line-clamp-2">{b.description}</div>
            {!b.earned && b.progress && (
              <div className="mt-2 h-1 bg-surface-alt rounded-full overflow-hidden">
                <div className="h-full bg-oly-blue transition-all" style={{ width: `${(b.progress.current / b.progress.target) * 100}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const me = useStore((s) => s.currentUserId ? s.users.find((u) => u.id === s.currentUserId) ?? null : null);
  const updateProfile = useStore((s) => s.updateProfile);
  const [name, setName] = useState(me?.name ?? "");
  const [color, setColor] = useState(me?.color ?? "#0085C7");
  if (!me) return null;
  return (
    <Modal
      open
      onClose={onClose}
      title="Modifier mon profil"
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost">Annuler</button>
          <button onClick={() => { const n = name.trim() || me.name; updateProfile({ name: n, color, avatar: n.charAt(0).toUpperCase() }); toast("Profil mis à jour", "success"); onClose(); }} className="btn btn-primary">Enregistrer</button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold block mb-1.5">Pseudo</label>
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1.5">Couleur de l&apos;avatar</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-11 w-full p-1 border border-border rounded-lg" />
        </div>
      </div>
    </Modal>
  );
}
