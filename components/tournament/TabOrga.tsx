"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, useStore } from "@/lib/store";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";
import type { Tournament, TournamentStatus } from "@/lib/types";

export default function TabOrga({ t }: { t: Tournament }) {
  const router = useRouter();
  const users = useStore((s) => s.users);
  const me = useStore((s) => s.currentUserId);
  const removeOrganizer = useStore((s) => s.removeOrganizer);
  const updateTournament = useStore((s) => s.updateTournament);
  const deleteTournament = useStore((s) => s.deleteTournament);
  const [addOrgaOpen, setAddOrgaOpen] = useState(false);

  const orgs = t.organizers.map((id) => users.find((u) => u.id === id)).filter(Boolean);
  const isCreator = t.createdBy === me;

  const onDelete = () => {
    if (!confirm("Supprimer ce tournoi définitivement ?")) return;
    deleteTournament(t.id);
    toast("Tournoi supprimé");
    router.push("/tournois");
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-display text-[22px] mb-3">👥 Co-organisateurs</h3>
          <p className="text-ink-soft text-sm mb-4">Les co-organisateurs peuvent ajouter des jeux, saisir les résultats et gérer les joueurs.</p>
          <div className="flex flex-col gap-2">
            {orgs.map((u) => {
              if (!u) return null;
              return (
                <div key={u.id} className="flex justify-between items-center p-2.5 border border-border rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <Avatar user={u} size="sm" />
                    <div>
                      <div className="font-bold text-sm">{u.name}</div>
                      <div className="text-xs text-ink-mute">{u.id === t.createdBy ? "Créateur du tournoi" : "Co-organisateur"}</div>
                    </div>
                  </div>
                  {isCreator && u.id !== t.createdBy && (
                    <button onClick={() => { removeOrganizer(t.id, u.id); toast("Co-organisateur retiré"); }} className="btn btn-danger btn-sm">Retirer</button>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={() => setAddOrgaOpen(true)} className="btn btn-primary btn-block mt-5">+ Ajouter un co-organisateur</button>
        </div>

        <div className="card">
          <h3 className="font-display text-[22px] mb-3">⚙️ Paramètres du tournoi</h3>
          <div className="flex flex-col gap-3.5">
            <div>
              <label className="text-sm font-semibold block mb-1.5">Statut</label>
              <select className="field-input" value={t.status} onChange={(e) => { updateTournament(t.id, { status: e.target.value as TournamentStatus }); toast("Statut mis à jour", "success"); }}>
                <option value="open">Inscriptions ouvertes</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">Date de début</label>
              <input type="date" className="field-input" value={t.startDate} onChange={(e) => updateTournament(t.id, { startDate: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">Nombre max de joueurs</label>
              <input type="number" min={2} max={64} className="field-input" value={t.maxPlayers} onChange={(e) => { const v = parseInt(e.target.value) || t.maxPlayers; updateTournament(t.id, { maxPlayers: v }); }} />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">Nom du tournoi</label>
              <input className="field-input" value={t.name} onChange={(e) => updateTournament(t.id, { name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">Description</label>
              <textarea className="field-input min-h-[80px] resize-y" value={t.description} onChange={(e) => updateTournament(t.id, { description: e.target.value })} />
            </div>
            {isCreator && (<button onClick={onDelete} className="btn btn-danger btn-block mt-2">🗑 Supprimer le tournoi</button>)}
          </div>
        </div>
      </div>

      {addOrgaOpen && (<AddOrgaModal tid={t.id} onClose={() => setAddOrgaOpen(false)} />)}
    </>
  );
}

function AddOrgaModal({ tid, onClose }: { tid: string; onClose: () => void }) {
  const users = useStore((s) => s.users);
  const tournament = useStore((s) => s.tournaments.find((t) => t.id === tid));
  const addOrganizer = useStore((s) => s.addOrganizer);
  const [pid, setPid] = useState("");
  if (!tournament) return null;
  const candidates = users.filter((u) => !tournament.organizers.includes(u.id));

  if (candidates.length === 0) {
    return (<Modal open onClose={onClose} title="Ajouter un co-organisateur" footer={<button onClick={onClose} className="btn btn-ghost">Fermer</button>}><p className="text-ink-soft">Tous les utilisateurs sont déjà organisateurs.</p></Modal>);
  }

  return (
    <Modal open onClose={onClose} title="Ajouter un co-organisateur" footer={<><button onClick={onClose} className="btn btn-ghost">Annuler</button><button onClick={() => { if (!pid) return; addOrganizer(tid, pid); toast("Co-organisateur ajouté", "success"); onClose(); }} className="btn btn-primary">Ajouter</button></>}>
      <p className="text-ink-soft text-sm mb-4">Il pourra ajouter des jeux, saisir les résultats et gérer les joueurs.</p>
      <label className="text-sm font-semibold block mb-1.5">Joueur</label>
      <select className="field-input" value={pid} onChange={(e) => setPid(e.target.value)}>
        <option value="">— Choisir —</option>
        {candidates.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
      </select>
    </Modal>
  );
}
