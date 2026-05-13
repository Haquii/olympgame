"use client";

import { useState } from "react";
import { toast, useStore } from "@/lib/store";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";
import type { Tournament } from "@/lib/types";

export default function TabPlayers({
  t,
  canEdit,
}: {
  t: Tournament;
  canEdit: boolean;
}) {
  const users = useStore((s) => s.users);
  const [addOpen, setAddOpen] = useState(false);
  const players = t.players
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean);

  return (
    <>
      <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
        <p className="text-ink-soft">
          {players.length} joueurs inscrits sur {t.maxPlayers} places.
        </p>
        {canEdit && t.players.length < t.maxPlayers && (
          <button
            onClick={() => setAddOpen(true)}
            className="btn btn-primary btn-sm"
          >
            + Ajouter un joueur
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((u) => {
          if (!u) return null;
          const isOrga = t.organizers.includes(u.id);
          return (
            <div key={u.id} className="card flex items-center gap-3.5">
              <Avatar user={u} size="lg" />
              <div>
                <div className="font-bold">{u.name}</div>
                <div className="text-xs text-ink-mute">
                  {isOrga ? "⚙️ Organisateur" : "🎮 Joueur"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {addOpen && (
        <AddPlayerModal tid={t.id} onClose={() => setAddOpen(false)} />
      )}
    </>
  );
}

function AddPlayerModal({
  tid,
  onClose,
}: {
  tid: string;
  onClose: () => void;
}) {
  const users = useStore((s) => s.users);
  const tournament = useStore((s) => s.tournaments.find((t) => t.id === tid));
  const join = useStore((s) => s.joinTournament);
  const [pid, setPid] = useState("");
  if (!tournament) return null;
  const candidates = users.filter((u) => !tournament.players.includes(u.id));

  if (candidates.length === 0) {
    return (
      <Modal
        open
        onClose={onClose}
        title="Inviter un joueur"
        footer={
          <button onClick={onClose} className="btn btn-ghost">
            Fermer
          </button>
        }
      >
        <p className="text-ink-soft">Tous les utilisateurs sont déjà inscrits.</p>
      </Modal>
    );
  }

  const submit = () => {
    if (!pid) return;
    join(tid, pid);
    toast("Joueur inscrit", "success");
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Inviter un joueur"
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost">
            Annuler
          </button>
          <button onClick={submit} className="btn btn-primary">
            Inscrire
          </button>
        </>
      }
    >
      <label className="text-sm font-semibold block mb-1.5">Joueur</label>
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
    </Modal>
  );
}
