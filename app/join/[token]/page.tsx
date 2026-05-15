"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast, useStore, useHasHydrated } from "@/lib/store";
import { supabaseEnabled } from "@/lib/supabase/config";

export default function JoinPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const hydrated = useHasHydrated();
  const me = useStore((s) => s.currentUserId);
  const tournaments = useStore((s) => s.tournaments);
  const joinTournament = useStore((s) => s.joinTournament);
  const [status, setStatus] = useState<"loading" | "needsAuth" | "joining" | "done" | "error">("loading");

  useEffect(() => {
    if (!hydrated) return;
    const token = params?.token as string;
    if (!token) { setStatus("error"); return; }

    const t = tournaments.find((x) => x.id === token);
    if (!t) { setStatus("error"); return; }
    if (!me) { setStatus("needsAuth"); return; }
    if (t.players.includes(me)) {
      router.replace(`/tournois/${t.id}`);
      return;
    }
    if (t.players.length >= t.maxPlayers) {
      setStatus("error");
      toast("Tournoi complet", "error");
      return;
    }
    setStatus("joining");
    joinTournament(t.id);
    toast(`Bienvenue dans ${t.name} 🏆`, "success");
    setTimeout(() => router.replace(`/tournois/${t.id}`), 600);
    setStatus("done");
  }, [hydrated, params, me, tournaments, joinTournament, router]);

  return (
    <div className="container-app pt-16 max-w-[520px] text-center">
      <div className="text-[64px] mb-4">🎟️</div>
      {status === "loading" && <p className="text-ink-soft">Validation du lien...</p>}
      {status === "needsAuth" && (
        <>
          <h1 className="font-display text-[32px] mb-2">Connecte-toi pour rejoindre</h1>
          <p className="text-ink-soft mb-5">Crée ton profil en 5 secondes, on te ramène ensuite sur le tournoi.</p>
          <Link href="/profil" className="btn btn-primary">Créer mon profil</Link>
        </>
      )}
      {status === "joining" && <p>Inscription en cours...</p>}
      {status === "done" && <p>Redirection...</p>}
      {status === "error" && (
        <>
          <h1 className="font-display text-[32px] mb-2">Lien invalide</h1>
          <p className="text-ink-soft mb-5">Ce lien d&apos;invitation n&apos;existe pas ou a expiré.</p>
          <Link href="/tournois" className="btn btn-primary">Voir les tournois</Link>
        </>
      )}
      {supabaseEnabled && (
        <p className="text-xs text-ink-mute mt-8">Backend Supabase activé · token résolu côté serveur</p>
      )}
    </div>
  );
}
