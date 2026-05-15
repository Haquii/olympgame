import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-white py-8">
      <div className="container-app flex justify-between items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center" aria-hidden>
            {["#0085C7", "#0A1F2E", "#DF0024", "#F4C300", "#009F3D"].map((c, i) => (
              <span key={i} className="w-4 h-4 rounded-full border-[3px] -mr-1.5" style={{ borderColor: c }} />
            ))}
          </span>
          <span className="text-sm text-ink-soft ml-2">
            Olymp&apos;Game — Le tournoi multi-jeux entre amis. Gratuit, fun, à toi.
          </span>
        </div>
        <div className="flex items-center gap-5 text-xs text-ink-mute">
          <Link href="/legal" className="hover:text-ink">Mentions légales</Link>
          <a href="https://github.com/Haquii/olympgame" className="hover:text-ink" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span>© {new Date().getFullYear()} Olymp&apos;Game</span>
        </div>
      </div>
    </footer>
  );
}
