"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useHasHydrated, useStore } from "@/lib/store";
import Avatar from "./Avatar";
import clsx from "clsx";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/tournois", label: "Tournois" },
  { href: "/creer", label: "Créer un tournoi" },
  { href: "/profil", label: "Mon profil" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHasHydrated();
  const me = useStore((s) => s.currentUserId ? s.users.find((u) => u.id === s.currentUserId) ?? null : null);

  return (
    <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-border">
      <div className="container-app flex items-center justify-between h-[68px] gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-grad-card grid place-items-center text-white font-bold text-lg shadow-card">O</div>
          <div className="font-display text-[26px] tracking-[1.5px] text-ink leading-none">OLYMP<span className="text-oly-yellow">&apos;</span>GAME</div>
        </Link>
        <div className="hidden md:flex items-center gap-1.5">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={clsx("px-3.5 py-2 rounded-lg font-medium text-sm transition-colors", active ? "bg-oly-black text-white" : "text-ink-soft hover:bg-surface-alt hover:text-ink")}>
                {l.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2.5">
          {hydrated && me ? (
            <button onClick={() => router.push("/profil")} className="flex items-center gap-2.5 cursor-pointer" aria-label="Mon profil">
              <Avatar user={me} size="md" />
              <span className="hidden sm:inline text-sm font-bold">{me.name}</span>
            </button>
          ) : (
            <button onClick={() => router.push("/profil")} className="btn btn-primary btn-sm">Se connecter</button>
          )}
        </div>
      </div>
    </nav>
  );
}
