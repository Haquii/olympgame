"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { toast, useStore, useHasHydrated } from "@/lib/store";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";
import PointsEditor from "@/components/PointsEditor";
import {
  BANNER_EMOJIS,
  DEFAULT_POINTS,
  POPULAR_GAMES,
  uid,
} from "@/lib/utils";
import type { Game, PointEntry } from "@/lib/types";

type Draft = {
  step: 1 | 2 | 3;
  name: string;
  description: string;
  bannerEmoji: string;
  startDate: string;
  maxPlayers: number;
  games: Game[];
  organizers: string[];
};

export default function CreerPage() {
  const router = useRouter();
  const hydrated = useHasHydrated();
  const users = useStore((s) => s.users);
  const me = useStore((s) => s.currentUserId);
  const createTournament = useStore((s) => s.createTournament);

  const [d, setD] = useState<Draft>(() => ({
    step: 1,
    name: "",
    description: "",
    bannerEmoji: "🏆",
    startDate: "",
    maxPlayers: 12,
    games: [],
    organizers: me ? [me] : [],
  }));

  const [editPointsGame, setEditPointsGame] = useState<Game | null>(null);

  if (!hydrated) return null;

  if (!me) {
    return (
      <div className="container-app pt-12 max-w-[480px]">
        <div className="card p-7">
          <h2 className="font-display text-[38px] mb-2">Connecte-toi d&apos;abord</h2>
          <p className="text-ink-soft mb-5">
            Tu dois avoir un profil pour créer un tournoi.
          </p>
          <button
            onClick={() => router.push("/profil")}
            className="btn btn-primary btn-block"
          >
            Créer mon profil
          </button>
        </div>
      </div>
    );
  }

  const next = () => setD((s) => ({ ...s, step: (s.step + 1) as Draft["step"] }));
  const prev = () => setD((s) => ({ ...s, step: (s.step - 1) as Draft["step"] }));

  const goStep2 = () => {
    if (!d.name.trim()) return toast("Donne un nom à ton tournoi", "error");
    next();
  };
  const goStep3 = () => {
    if (d.games.length === 0)
      return toast("Ajoute au moins un jeu", "error");
    next();
  };

  const submit = () => {
    const created = createTournament({
      name: d.name.trim(),
      description: d.description.trim(),
      bannerEmoji: d.bannerEmoji,
      startDate: d.startDate,
      maxPlayers: d.maxPlayers,
      games: d.games,
      organizers: d.organizers,
    });
    toast("Tournoi créé ! En route pour la gloire 🏆", "success");
    router.push(`/tournois/${created.id}`);
  };

  const addPopularGame = (name: string, emoji: string) => {
    if (d.games.some((g) => g.name === name))
      return toast(`${name} est déjà ajouté`, "error");
    setD((s) => ({
      ...s,
      games: [
        ...s.games,
        {
          id: uid("g"),
          name,
          emoji,
          pointsSystem: [...DEFAULT_POINTS],
          results: [],
        },
      ],
    }));
  };

  const addCustomGame = (name: string, emoji: string) => {
    if (!name.trim()) return toast("Donne un nom au jeu", "error");
    if (d.games.some((g) => g.name === name))
      return toast("Déjà ajouté", "error");
    setD((s) => ({
      ...s,
      games: [
        ...s.games,
        {
          id: uid("g"),
          name: name.trim(),
          emoji: emoji.trim() || "🎮",
          pointsSystem: [...DEFAULT_POINTS],
          results: [],
        },
      ],
    }));
  };

  return (
    <div className="container-app pt-8 max-w-[780px]">
      <header className="mb-6">
        <h2 className="font-display text-[38px] tracking-wider leading-none">
          Créer un tournoi
        </h2>
        <p className="text-ink-soft text-[15px] mt-1.5">
          Quelques infos et c&apos;est parti.
        </p>
      </header>

      {/* Steps */}
      <div className="flex gap-1.5 mb-8">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={clsx(
              "flex-1 h-1 rounded-full",
              d.step === n
                ? "bg-oly-blue"
                : d.step > n
                ? "bg-oly-yellow"
                : "bg-border"
            )}
          />
        ))}
      </div>

      <div className="card p-7">
        {d.step === 1 && (
          <>
            <h3 className="font-display text-[26px] mb-1.5">
              Étape 1 · Les bases
            </h3>
            <p className="text-ink-soft mb-6">Donne une identité à ton tournoi.</p>
            <div className="flex flex-col gap-4">
              <Field label="Nom du tournoi *">
                <input
                  className="field-input"
                  value={d.name}
                  onChange={(e) => setD((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Ex. Olympiades du Printemps 2026"
                />
              </Field>
              <Field label="Description">
                <textarea
                  className="field-input min-h-[90px] resize-y"
                  value={d.description}
                  onChange={(e) =>
                    setD((s) => ({ ...s, description: e.target.value }))
                  }
                  placeholder="Le concept, l'ambiance, les enjeux..."
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Emoji de bannière">
                  <select
                    className="field-input"
                    value={d.bannerEmoji}
                    onChange={(e) =>
                      setD((s) => ({ ...s, bannerEmoji: e.target.value }))
                    }
                  >
                    {BANNER_EMOJIS.map((e) => (
                      <option key={e}>{e}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Date de début">
                  <input
                    type="date"
                    className="field-input"
                    value={d.startDate}
                    onChange={(e) =>
                      setD((s) => ({ ...s, startDate: e.target.value }))
                    }
                  />
                </Field>
              </div>
              <Field label="Nombre max de joueurs" hint="Entre 2 et 64">
                <input
                  type="number"
                  min={2}
                  max={64}
                  className="field-input"
                  value={d.maxPlayers}
                  onChange={(e) =>
                    setD((s) => ({
                      ...s,
                      maxPlayers: parseInt(e.target.value) || 12,
                    }))
                  }
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2.5 mt-6">
              <button
                className="btn btn-ghost"
                onClick={() => router.push("/tournois")}
              >
                Annuler
              </button>
              <button className="btn btn-primary" onClick={goStep2}>
                Continuer →
              </button>
            </div>
          </>
        )}

        {d.step === 2 && (
          <>
            <h3 className="font-display text-[26px] mb-1.5">
              Étape 2 · Les jeux
            </h3>
            <p className="text-ink-soft mb-6">
              Ajoute les jeux du tournoi. Tu peux ajuster les barèmes de points
              ensuite.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-6">
              {POPULAR_GAMES.map((g) => (
                <button
                  key={g.name}
                  onClick={() => addPopularGame(g.name, g.emoji)}
                  className="filter-pill"
                >
                  {g.emoji} {g.name}
                </button>
              ))}
            </div>
            <CustomGameRow onAdd={addCustomGame} />
            <div className="divider" />
            <h4 className="font-bold mb-3">Jeux choisis ({d.games.length})</h4>
            {d.games.length === 0 ? (
              <p className="text-ink-soft text-sm">
                Aucun jeu sélectionné. Choisis-en au moins un.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {d.games.map((g, i) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between bg-surface-alt rounded-lg px-3.5 py-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[22px]">{g.emoji}</span>
                      <span className="font-bold truncate">{g.name}</span>
                      <span className="text-xs text-ink-mute hidden sm:inline">
                        Barème :{" "}
                        {g.pointsSystem.map((p) => p.points).join(" / ")}
                      </span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setEditPointsGame(g)}
                        className="btn btn-ghost btn-sm"
                      >
                        Barème
                      </button>
                      <button
                        onClick={() =>
                          setD((s) => ({
                            ...s,
                            games: s.games.filter((_, idx) => idx !== i),
                          }))
                        }
                        className="btn btn-danger btn-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2.5 mt-6">
              <button className="btn btn-ghost" onClick={prev}>
                ← Retour
              </button>
              <button className="btn btn-primary" onClick={goStep3}>
                Continuer →
              </button>
            </div>
          </>
        )}

        {d.step === 3 && (
          <>
            <h3 className="font-display text-[26px] mb-1.5">
              Étape 3 · Les co-organisateurs
            </h3>
            <p className="text-ink-soft mb-6">
              Optionnel. Ajoute des amis qui pourront gérer le tournoi avec toi.
            </p>
            <Field label="Organisateurs actuels">
              <div className="flex flex-wrap gap-2">
                {d.organizers.map((id) => {
                  const u = users.find((x) => x.id === id);
                  if (!u) return null;
                  return (
                    <div
                      key={id}
                      className="inline-flex items-center gap-2 bg-surface-alt rounded-full pl-1 pr-3 py-1 text-[13px]"
                    >
                      <Avatar user={u} size="sm" />
                      <span>{u.name}</span>
                      {id === me ? (
                        <span className="text-xs text-ink-mute">(toi)</span>
                      ) : (
                        <button
                          onClick={() =>
                            setD((s) => ({
                              ...s,
                              organizers: s.organizers.filter((o) => o !== id),
                            }))
                          }
                          className="text-ink-mute hover:text-oly-red px-1"
                          aria-label="Retirer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Field>
            <AddOrgaPicker
              candidates={users.filter((u) => !d.organizers.includes(u.id))}
              onAdd={(id) =>
                setD((s) => ({ ...s, organizers: [...s.organizers, id] }))
              }
            />
            <div className="divider" />
            <div className="card bg-surface-alt border-0 p-5">
              <h4 className="font-bold mb-2">📋 Récapitulatif</h4>
              <ul className="text-sm flex flex-col gap-1">
                <li>
                  <strong>Nom :</strong> {d.name}
                </li>
                <li>
                  <strong>Jeux :</strong>{" "}
                  {d.games.map((g) => `${g.emoji} ${g.name}`).join(", ")}
                </li>
                <li>
                  <strong>Joueurs max :</strong> {d.maxPlayers}
                </li>
                <li>
                  <strong>Organisateurs :</strong>{" "}
                  {d.organizers
                    .map((id) => users.find((u) => u.id === id)?.name)
                    .filter(Boolean)
                    .join(", ")}
                </li>
              </ul>
            </div>
            <div className="flex justify-end gap-2.5 mt-6">
              <button className="btn btn-ghost" onClick={prev}>
                ← Retour
              </button>
              <button className="btn btn-accent btn-lg" onClick={submit}>
                🏆 Créer le tournoi
              </button>
            </div>
          </>
        )}
      </div>

      {editPointsGame && (
        <PointsEditModal
          game={editPointsGame}
          onClose={() => setEditPointsGame(null)}
          onSave={(next) => {
            setD((s) => ({
              ...s,
              games: s.games.map((g) =>
                g.id === editPointsGame.id ? { ...g, pointsSystem: next } : g
              ),
            }));
            setEditPointsGame(null);
          }}
        />
      )}
    </div>
  );
}

/* ---------- helpers ---------- */
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-ink-mute mt-1">{hint}</p>}
    </div>
  );
}

function CustomGameRow({
  onAdd,
}: {
  onAdd: (name: string, emoji: string) => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎲");
  return (
    <div className="flex gap-2.5 mb-2 flex-wrap sm:flex-nowrap">
      <input
        className="field-input flex-1"
        placeholder="Nom du jeu personnalisé"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="field-input w-[70px] text-center"
        placeholder="🎲"
        maxLength={2}
        value={emoji}
        onChange={(e) => setEmoji(e.target.value)}
      />
      <button
        className="btn btn-ghost"
        onClick={() => {
          onAdd(name, emoji);
          setName("");
        }}
      >
        Ajouter
      </button>
    </div>
  );
}

function AddOrgaPicker({
  candidates,
  onAdd,
}: {
  candidates: { id: string; name: string }[];
  onAdd: (id: string) => void;
}) {
  const [pid, setPid] = useState("");
  if (candidates.length === 0)
    return (
      <p className="text-ink-soft text-sm">
        Tous les joueurs sont déjà organisateurs.
      </p>
    );
  return (
    <div>
      <Field label="Ajouter un co-organisateur">
        <select
          className="field-input"
          value={pid}
          onChange={(e) => setPid(e.target.value)}
        >
          <option value="">— Choisir un joueur —</option>
          {candidates.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </Field>
      <button
        onClick={() => {
          if (!pid) return;
          onAdd(pid);
          setPid("");
        }}
        className="btn btn-ghost btn-sm mt-2"
      >
        + Ajouter
      </button>
    </div>
  );
}

function PointsEditModal({
  game,
  onClose,
  onSave,
}: {
  game: Game;
  onClose: () => void;
  onSave: (next: PointEntry[]) => void;
}) {
  const [points, setPoints] = useState<PointEntry[]>(game.pointsSystem);
  return (
    <Modal
      open
      onClose={onClose}
      title={`${game.emoji} ${game.name} — Barème`}
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost">
            Annuler
          </button>
          <button
            onClick={() => {
              if (points.length === 0)
                return toast("Ajoute au moins une place", "error");
              onSave(points);
            }}
            className="btn btn-primary"
          >
            Enregistrer
          </button>
        </>
      }
    >
      <p className="text-ink-soft text-sm mb-5">
        Définis combien de points rapporte chaque place.
      </p>
      <PointsEditor initial={points} onChange={setPoints} />
    </Modal>
  );
}
