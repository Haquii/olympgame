"use client";

import { useState } from "react";
import clsx from "clsx";
import { toast, useStore } from "@/lib/store";
import Modal from "@/components/Modal";
import PointsEditor from "@/components/PointsEditor";
import Empty from "@/components/Empty";
import Bracket from "@/components/tournament/Bracket";
import { POPULAR_GAMES } from "@/lib/utils";
import {
  FORMAT_DESCRIPTIONS,
  FORMAT_LABELS,
  generateDoubleElim,
  generateRoundRobin,
  generateSingleElim,
  generateSwiss,
} from "@/lib/formats";
import type {
  Game,
  GameFormat,
  GameResult,
  PointEntry,
  Tournament,
} from "@/lib/types";

export default function TabGames({ t, canEdit }: { t: Tournament; canEdit: boolean }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [resultsGame, setResultsGame] = useState<Game | null>(null);

  return (
    <>
      <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
        <p className="text-ink-soft">Configure les jeux, leurs formats et barèmes de points.</p>
        {canEdit && (<button onClick={() => setAddOpen(true)} className="btn btn-primary btn-sm">+ Ajouter un jeu</button>)}
      </div>

      {t.games.length === 0 ? (
        <Empty icon="🎮" title="Aucun jeu pour le moment" />
      ) : (
        <div className="flex flex-col gap-4">
          {t.games.map((g) => (
            <GameBlock key={g.id} t={t} g={g} canEdit={canEdit} onEdit={() => setEditGame(g)} onResults={() => setResultsGame(g)} />
          ))}
        </div>
      )}

      {addOpen && <AddGameModal onClose={() => setAddOpen(false)} tid={t.id} />}
      {editGame && (<EditGameModal tid={t.id} g={editGame} onClose={() => setEditGame(null)} />)}
      {resultsGame && (<ResultsModal t={t} g={resultsGame} onClose={() => setResultsGame(null)} />)}
    </>
  );
}

function GameBlock({ t, g, canEdit, onEdit, onResults }: { t: Tournament; g: Game; canEdit: boolean; onEdit: () => void; onResults: () => void }) {
  const users = useStore((s) => s.users);
  const updateGame = useStore((s) => s.updateGame);
  const format: GameFormat = g.format ?? "ranked";
  const isRanked = format === "ranked";
  const played = isRanked ? g.results.length > 0 : (g.matches?.length ?? 0) > 0;
  const top3 = g.results.filter((r) => r.rank <= 3).sort((a, b) => a.rank - b.rank);

  const generateBracket = () => {
    let matches;
    switch (format) {
      case "round_robin": matches = generateRoundRobin(t.players); break;
      case "single_elim": matches = generateSingleElim(t.players); break;
      case "double_elim": matches = generateDoubleElim(t.players); break;
      case "swiss": matches = generateSwiss(t.players); break;
      default: return;
    }
    updateGame(t.id, g.id, { matches });
    toast("Bracket généré 🏆", "success");
  };

  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-4">
        <div className="text-3xl w-[54px] h-[54px] bg-surface-alt rounded-lg grid place-items-center">{g.emoji}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-bold text-[16px]">{g.name}</div>
            <span className="badge bg-surface-alt text-ink-soft text-[10px]">{FORMAT_LABELS[format].split(" (")[0]}</span>
          </div>
          <div className="text-xs text-ink-mute mt-0.5">
            {isRanked
              ? played ? `✅ ${g.results.length} résultats enregistrés` : "⏳ En attente de résultats"
              : played ? `🥊 ${g.matches?.filter((m) => m.winnerId).length ?? 0} / ${g.matches?.length ?? 0} matches joués` : "⏳ Bracket non généré"}
          </div>
          {isRanked && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {g.pointsSystem.slice(0, 6).map((p) => (
                <span key={p.rank} className={clsx("text-[11px] px-2.5 py-0.5 rounded-full font-semibold", p.rank === 1 && "bg-yellow-100 text-yellow-800", p.rank === 2 && "bg-slate-100 text-slate-600", p.rank === 3 && "bg-orange-100 text-orange-700", p.rank > 3 && "bg-surface-alt text-ink-soft")}>#{p.rank} · {p.points} pts</span>
              ))}
            </div>
          )}
          {isRanked && played && top3.length > 0 && (
            <div className="text-xs text-ink-soft mt-2">
              Podium : {top3.map((r) => { const u = users.find((u) => u.id === r.playerId); if (!u) return ""; const medal = r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : "🥉"; return `${medal} ${u.name}`; }).filter(Boolean).join("  ·  ")}
            </div>
          )}
        </div>
        {canEdit && (
          <div className="flex flex-col gap-1.5 shrink-0">
            {isRanked ? (
              <button onClick={onResults} className="btn btn-blue btn-sm">{played ? "Modifier" : "Saisir"} résultats</button>
            ) : (
              <button onClick={generateBracket} className="btn btn-blue btn-sm" disabled={t.players.length < 2}>{played ? "Régénérer" : "Générer"} bracket</button>
            )}
            <button onClick={onEdit} className="btn btn-ghost btn-sm">Éditer</button>
          </div>
        )}
      </div>

      {!isRanked && played && (
        <div className="mt-5 pt-5 border-t border-border">
          <Bracket t={t} g={g} canEdit={canEdit} />
        </div>
      )}
    </div>
  );
}

function AddGameModal({ onClose, tid }: { onClose: () => void; tid: string }) {
  const addGame = useStore((s) => s.addGame);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎮");
  const [format, setFormat] = useState<GameFormat>("ranked");
  const submit = () => {
    if (!name.trim()) return toast("Donne un nom au jeu", "error");
    addGame(tid, name.trim(), emoji.trim() || "🎮", format);
    toast("Jeu ajouté", "success");
    onClose();
  };
  return (
    <Modal open onClose={onClose} title="Ajouter un jeu" footer={<><button onClick={onClose} className="btn btn-ghost">Annuler</button><button onClick={submit} className="btn btn-primary">Ajouter</button></>}>
      <div className="mb-4">
        <label className="text-sm font-semibold block mb-1.5">Jeux populaires</label>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_GAMES.map((g) => (<button key={g.name} onClick={() => { setName(g.name); setEmoji(g.emoji); }} className="filter-pill">{g.emoji} {g.name}</button>))}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_80px] gap-3 mb-4">
        <div>
          <label className="text-sm font-semibold block mb-1.5">Nom du jeu</label>
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Mario Kart" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1.5">Emoji</label>
          <input className="field-input text-center" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold block mb-1.5">Format</label>
        <select className="field-input" value={format} onChange={(e) => setFormat(e.target.value as GameFormat)}>
          <option value="ranked">{FORMAT_LABELS.ranked}</option>
          <option value="round_robin">{FORMAT_LABELS.round_robin}</option>
          <option value="single_elim">{FORMAT_LABELS.single_elim}</option>
          <option value="double_elim">{FORMAT_LABELS.double_elim}</option>
          <option value="swiss">{FORMAT_LABELS.swiss}</option>
        </select>
        <p className="text-xs text-ink-mute mt-1.5">{FORMAT_DESCRIPTIONS[format]}</p>
      </div>
    </Modal>
  );
}

function EditGameModal({ tid, g, onClose }: { tid: string; g: Game; onClose: () => void }) {
  const updateGame = useStore((s) => s.updateGame);
  const removeGame = useStore((s) => s.removeGame);
  const [name, setName] = useState(g.name);
  const [emoji, setEmoji] = useState(g.emoji);
  const [points, setPoints] = useState<PointEntry[]>(g.pointsSystem);

  const submit = () => {
    if (!name.trim()) return toast("Donne un nom au jeu", "error");
    if (points.length === 0) return toast("Ajoute au moins une place", "error");
    updateGame(tid, g.id, { name: name.trim(), emoji: emoji.trim() || "🎮", pointsSystem: points });
    toast("Jeu mis à jour", "success");
    onClose();
  };

  const onDelete = () => {
    if (!confirm("Supprimer ce jeu ?")) return;
    removeGame(tid, g.id);
    toast("Jeu supprimé");
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Éditer le jeu" footer={<><button onClick={onDelete} className="btn btn-danger">🗑 Supprimer</button><div className="flex-1" /><button onClick={onClose} className="btn btn-ghost">Annuler</button><button onClick={submit} className="btn btn-primary">Enregistrer</button></>}>
      <div className="grid grid-cols-[1fr_80px] gap-3 mb-4">
        <div>
          <label className="text-sm font-semibold block mb-1.5">Nom</label>
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1.5">Emoji</label>
          <input className="field-input text-center" value={emoji} maxLength={2} onChange={(e) => setEmoji(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold block mb-2">Barème de points</label>
        <PointsEditor initial={points} onChange={setPoints} />
      </div>
    </Modal>
  );
}

function ResultsModal({ t, g, onClose }: { t: Tournament; g: Game; onClose: () => void }) {
  const users = useStore((s) => s.users);
  const saveResults = useStore((s) => s.saveResults);
  const [ranks, setRanks] = useState<Record<string, number | "">>(() => {
    const m: Record<string, number | ""> = {};
    t.players.forEach((p) => { const r = g.results.find((x) => x.playerId === p); m[p] = r ? r.rank : ""; });
    return m;
  });

  const submit = () => {
    const results: GameResult[] = [];
    Object.entries(ranks).forEach(([pid, r]) => { if (r) results.push({ playerId: pid, rank: Number(r) }); });
    saveResults(t.id, g.id, results);
    toast("Résultats enregistrés", "success");
    onClose();
  };

  const clear = () => {
    if (!confirm("Effacer les résultats de ce jeu ?")) return;
    saveResults(t.id, g.id, []);
    toast("Résultats effacés");
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={`${g.emoji} ${g.name} — Résultats`} footer={<><button onClick={clear} className="btn btn-danger">Effacer</button><div className="flex-1" /><button onClick={onClose} className="btn btn-ghost">Annuler</button><button onClick={submit} className="btn btn-primary">Enregistrer</button></>}>
      <p className="text-ink-soft text-sm mb-5">Indique la place de chaque joueur. Le classement se recalcule automatiquement.</p>
      <div className="flex flex-col gap-2 max-h-[50vh] overflow-auto pr-1.5">
        {t.players.map((pid) => {
          const u = users.find((u) => u.id === pid);
          if (!u) return null;
          return (
            <div key={pid} className="flex justify-between items-center bg-surface-alt rounded-lg p-2.5 pl-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full grid place-items-center text-white font-bold text-[11px]" style={{ backgroundColor: u.color }}>{u.avatar}</div>
                <span className="font-bold text-sm">{u.name}</span>
              </div>
              <select value={ranks[pid] ?? ""} onChange={(e) => setRanks((m) => ({ ...m, [pid]: e.target.value ? Number(e.target.value) : "" }))} className="px-2.5 py-1.5 border border-border rounded-md text-sm bg-white">
                <option value="">— place —</option>
                {t.players.map((_, i) => (<option key={i} value={i + 1}>#{i + 1}{i === 0 ? " 🥇" : i === 1 ? " 🥈" : i === 2 ? " 🥉" : ""}</option>))}
              </select>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
