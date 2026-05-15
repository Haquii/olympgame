import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales · Olymp'Game",
  description:
    "Mentions légales, données personnelles et conditions d'utilisation d'Olymp'Game.",
};

export default function LegalPage() {
  return (
    <div className="container-app pt-10 pb-16 max-w-[760px]">
      <Link href="/" className="text-sm text-ink-soft hover:text-ink">
        ← Retour à l&apos;accueil
      </Link>
      <h1 className="font-display text-[42px] mt-4 mb-6 leading-none">
        Mentions légales
      </h1>

      <Section title="Éditeur du site">
        <p>
          Olymp&apos;Game est un projet personnel à but non commercial. Aucune
          collecte de données à des fins publicitaires n&apos;est effectuée.
        </p>
      </Section>

      <Section title="Hébergement">
        <p>
          Le site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133,
          Covina, CA 91723, États-Unis.
        </p>
      </Section>

      <Section title="Données personnelles (RGPD)">
        <p>
          Dans la version actuelle, toutes les données (pseudo, tournois,
          résultats) sont stockées localement dans ton navigateur
          (<code className="text-xs bg-surface-alt px-1.5 py-0.5 rounded">localStorage</code>).
          Aucune donnée n&apos;est envoyée à un serveur Olymp&apos;Game.
        </p>
        <p className="mt-3">
          Pour supprimer toutes tes données : ouvre le menu &laquo;&nbsp;Mon profil&nbsp;&raquo;
          et clique sur &laquo;&nbsp;Reset démo&nbsp;&raquo;. Ou efface le stockage du site
          dans les paramètres de ton navigateur.
        </p>
        <p className="mt-3 text-ink-soft text-sm">
          Lorsque l&apos;application sera connectée à un backend (Supabase), un
          email te sera demandé pour la connexion (magic link). Tu pourras
          supprimer ton compte à tout moment depuis ton profil. Ces données
          seront stockées dans l&apos;Union européenne.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          Aucun cookie de tracking n&apos;est utilisé. Vercel Analytics, si
          activé, collecte des métriques anonymes sans cookie d&apos;identification.
        </p>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          Les noms de jeux mentionnés (Mario Kart, FIFA, Smash Bros, etc.) sont
          la propriété de leurs éditeurs respectifs. Olymp&apos;Game ne revendique
          aucun droit sur ces marques et les utilise uniquement à titre indicatif.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Pour toute question, ouvre un ticket sur{" "}
          <a
            href="https://github.com/Haquii/olympgame/issues"
            className="text-oly-blue underline"
          >
            GitHub
          </a>
          .
        </p>
      </Section>

      <p className="text-xs text-ink-mute mt-12">
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="font-display text-[24px] mb-2.5">{title}</h2>
      <div className="text-ink leading-relaxed">{children}</div>
    </section>
  );
}
