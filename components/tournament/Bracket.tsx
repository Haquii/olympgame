"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { useStore, toast } from "@/lib/store";
import { setMatchWinner } from "@/lib/formats";
import Modal from "@/components/Modal";
import type { Game, Match, Tournament } from "@/lib/types";

/**
 * Affiche un bracket à élimination (single_elim) avec des matches cliquables.
 * Pour round_robin / swiss, on rend une grille de matches groupés par round.
 */
export default function Bracket({ t, g, canEdit }: { t: Tournament; g: Game; canEdit: boolean }) {
  const matches = g.matches ?? [];
  const isElim = g.format === "single_elim" || g.format === "double_elim";

  if (matches.length === 0) {
    return (<div className="text-sm text-ink-soft p-4 border border-dashed border-border rounded-xl">Bracket non généré. Lance le tournoi depuis l&apos;onglet Organisation.</div>);
  }

  return isElim ? (<ElimBracket t={t} g={g} matches={matches} canEdit={canEdit} />) : (<RoundRobinGrid t={t} g={g} matches={matches} canEdit={canEdit} />);
}

function ElimBracket({ t, g, matches, canEdit }: { t: Tournament; g: Game; matches: Match[]; canEdit: boolean }) {
  const [editing, setEditing] = useState<Match | null>(null);

  const rounds = useMemo(() => {
    const max = Math.max(...matches.map((m) => m.round));
    const out: Match[][] = [];
    for (let r = 1; r <= max; r++) {
      out.push(matches.filter((m) => m.round === r).sort((a, b) => a.position - b.position));
    }
    return out;
  }, [matches]);

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-4 -mx-2 px-2">
        {rounds.map((round, ri) => (
          <div key={ri} className="flex flex-col gap-3 min-w-[200px]" style={{ justifyContent: "space-around" }}>
            <div className="text-xs uppercase tracking-wider text-ink-mute font-bold mb-1">
              {ri === rounds.length - 1 ? "Finale" : ri === rounds.length - 2 ? "1/2" : ri === rounds.length - 3 ? "1/4" : `Round ${ri + 1}`}
            </div>
            {round.map((m) => (<BracketMatch key={m.id} t={t} match={m} canEdit={canEdit} onClick={() => canEdit && setEditing(m)} />))}
          </div>
        ))}
      </div>
      {editing && (<MatchEditModal t={t} g={g} match={editing} onClose={() => setEditing(null)} />)}
    </>
  );
}

function BracketMatch({ t, match, canEdit, onClick }: { t: Tournament; match: Match; canEdit: boolean; onClick: () => void }) {
  const users = useStore((s) => s.users);
  const a = match.playerA ? users.find((u) => u.id === match.playerA) : null;
  const b = match.playerB ? users.find((u) => u.id === match.playerB) : null;

  const renderSlot = (p: typeof a, rawId: string | null, isWinner: boolean) => (
    <div className={clsx("flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm min-h-[34px]", isWinner && "bg-oly-yellow/20 font-bold", !p && "text-ink-mute italic")}>
      {p ? (
        <>
          <div className="w-5 h-5 rounded-full grid place-items-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: p.color }}>{p.avatar}</div>
          <span className="truncate">{p.name}</span>
        </>
      ) : rawId === null ? (<span>— en attente —</span>) : (<span>?</span>)}
    </div>
  );

  const isAWinner = match.winnerId != null && match.winnerId === match.playerA;
  const isBWinner = match.winnerId != null && match.winnerId === match.playerB;

  return (
    <button onClick={onClick} disabled={!canEdit || !a || !b} className={clsx("bg-white border rounded-lg p-1 text-left transition-colors", match.winnerId ? "border-oly-yellow" : "border-border hover:border-ink-mute", (!canEdit || !a || !b) && "cursor-default opacity-90")}>
      {renderSlot(a, match.playerA, isAWinner)}
      <div className="border-t border-border my-0.5" />
      {renderSlot(b, match.playerB, isBWinner)}
    </button>
  );
}

function RoundRobinGrid({ t, g, matches, canEdit }: { t: Tournament; g: Game; matches: Match[]; canEdit: boolean }) {
  const [editing, setEditing] = useState<Match | null>(null);

  const rounds = useMemo(() => {
    const max = Math.max(...matches.map((m) => m.round));
    const out: Match[][] = [];
    for (let r = 1; r <= max; r++) out.push(matches.filter((m) => m.round === r));
    return out;
  }, [matches]);

  return (
    <>
      <div className="flex flex-col gap-5">
        {rounds.map((round, ri) => (
          <div key={ri}>
            <div className="text-xs uppercase tracking-wider text-ink-mute font-bold mb-2">Round {ri + 1}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {round.map((m) => (<BracketMatch key={m.id} t={t} match={m} canEdit={canEdit} onClick={() => canEdit && setEditing(m)} />))}
            </div>
          </div>
        ))}
      </div>
      {editing && (<MatchEditModal t={t} g={g} match={editing} onClose={() => setEditing(null)} />)}
    </>
  );
}

function MatchEditModal({ t, g, match, onClose }: { t: Tournament; g: Game; match: Match; onClose: () => void }) {
  const users = useStore((s) => s.users);
  const updateGame = useStore((s) => s.updateGame);
  const a = match.playerA ? users.find((u) => u.id === match.playerA) : null;
  const b = match.playerB ? users.find((u) => u.id === match.playerB) : null;

  const [scoreA, setScoreA] = useState<string>(match.scoreA?.toString() ?? "");
  const [scoreB, setScoreB] = useState<string>(match.scoreB?.toString() ?? "");

  const save = (winnerId: string | null) => {
    const matches = g.matches ?? [];
    let next = matches.map((m) => m.id === match.id ? { ...m, scoreA: scoreA === "" ? null : Number(scoreA), scoreB: scoreB === "" ? null : Number(scoreB), winnerId } : m);
    next = setMatchWinner(next, match.id, winnerId);
    updateGame(t.id, g.id, { matches: next });
    toast(winnerId ? "Match enregistré" : "Match remis à zéro", "success");
    onClose();
  };

  if (!a || !b) {
    return (
      <Modal open onClose={onClose} title="Match en attente" footer={<button onClick={onClose} className="btn btn-ghost">Fermer</button>}>
        <p className="text-ink-soft">Ce match attend que les rounds précédents se terminent.</p>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`${g.emoji} ${g.name} — Match`}
      footer={
        <>
          <button onClick={() => save(null)} className="btn btn-danger">Reset</button>
          <div className="flex-1" />
          <button onClick={onClose} className="btn btn-ghost">Annuler</button>
          <button onClick={() => save(a.id)} className="btn btn-blue">🏆 {a.name} gagne</button>
          <button onClick={() => save(b.id)} className="btn btn-blue">🏆 {b.name} gagne</button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <PlayerScoreCard user={a} score={scoreA} onChange={setScoreA} isWinner={match.winnerId === a.id} />
        <PlayerScoreCard user={b} score={scoreB} onChange={setScoreB} isWinner={match.winnerId === b.id} />
      </div>
      <p className="text-xs text-ink-mute mt-4 text-center">Saisis le score (optionnel) puis clique sur le gagnant.</p>
    </Modal>
  );
}

function PlayerScoreCard({ user, score, onChange, isWinner }: { user: { id: string; name: string; color: string; avatar: string }; score: string; onChange: (v: string) => void; isWinner: boolean }) {
  return (
    <div className={clsx("rounded-xl p-4 border-2 transition-colors", isWinner ? "border-oly-yellow bg-oly-yellow/10" : "border-border")}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full grid place-items-center text-white text-sm font-bold" style={{ backgroundColor: user.color }}>{user.avatar}</div>
        <span className="font-bold">{user.name}</span>
      </div>
      <input type="number" className="field-input text-center text-2xl font-display" value={score} onChange={(e) => onChange(e.target.value)} placeholder="—" />
    </div>
  );
}
