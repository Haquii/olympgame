# 🗺️ ROADMAP — Olymp'Game

Plan d'évolution du produit, du MVP localStorage actuel vers une plateforme multi-joueurs production-ready, puis monétisable.

**Lecture rapide :** 7 phases, ~25 jours-dev (≈ 5-6 semaines en solo focused). Phase 1 est non-négociable pour sortir du stade démo. Tout le reste se priorise selon l'usage réel.

---

## 🎯 Principes directeurs

1. **Pas de refonte big-bang.** Chaque phase est shippable indépendamment et apporte de la valeur seule.
2. **Le store Zustand reste l'API client.** On remplace son backend (localStorage → API) sans toucher aux composants.
3. **Vercel-first.** Toutes les briques choisies se déploient sans serveur dédié.
4. **Mobile compte autant que desktop.** On code mobile-first à partir de la phase 4.
5. **On mesure avant d'ajouter.** Sentry + Vercel Analytics dès la phase 1, sinon on optimise à l'aveugle.

---

## 📋 Tableau de bord

| # | Phase | Durée | Bloque la suite ? | Valeur utilisateur |
|---|-------|-------|-------------------|--------------------|
| 0 | Foundation hygiene | 1 j | ✅ pour les tests | Indirecte (qualité) |
| 1 | Backend + Auth | 4-5 j | ✅ pour tout | 🔥 critique |
| 2 | Realtime + Invitations | 2-3 j | Non | 🔥 critique |
| 3 | Formats de tournoi | 4-5 j | Non | 🟡 élevée |
| 4 | Mode live + PWA + mobile UX | 2-3 j | Non | 🟡 élevée |
| 5 | Social & engagement | 3-4 j | Non | 🟢 moyenne |
| 6 | Production readiness | 2-3 j | Pour ouvrir publiquement | 🟢 moyenne |
| 7 | Monétisation & scale | optionnel | — | À évaluer plus tard |

---

## Phase 0 — Foundation hygiene (1 jour)

Pose les filets avant d'accélérer.

**Livrables**
- ESLint + Prettier configurés et runnés en `npm run lint` (déjà partiel via Next).
- GitHub Actions : workflow `ci.yml` qui run `lint + build` sur chaque PR.
- Vitest installé + tests unitaires sur `lib/ranking.ts` (tie-breakers olympiques, cas limites : 0 joueurs, ex-aequo total, jeu sans résultat).
- Suppression du fichier `.bootstrap` résiduel du repo.
- Hook pre-commit (Husky + lint-staged) pour formater à la sauvegarde.

**Definition of done :** `npm run lint && npm run test && npm run build` passe en CI.

---

## Phase 1 — Backend partagé & authentification (4-5 jours)

**Le seul vrai blocker pour que le produit existe.** Aujourd'hui chaque navigateur a sa propre base. Deux potes ne voient pas le même tournoi. C'est rédhibitoire pour un produit social.

**Décision tech : Supabase**

J'ai comparé Vercel Postgres + NextAuth + Pusher vs Supabase :
- Supabase fournit auth + DB + realtime + storage dans une seule offre gratuite généreuse.
- Row Level Security (RLS) native = sécurité d'accès aux tournois sans middleware custom.
- Magic link + OAuth Google/Discord en quelques lignes.
- Si on bascule un jour, le SQL reste portable.

Voir `supabase/schema.sql` pour le schéma complet et `lib/supabase/*` pour le scaffold client.

**Definition of done**
- Je crée un tournoi sur mon laptop, ma sœur le voit depuis son iPhone après login Google.
- Tests d'intégration sur les Server Actions (Vitest).
- Sentry et Vercel Analytics branchés.

---

## Phase 2 — Realtime + invitations + emails (2-3 jours)

Ce qui transforme "outil de gestion" en "expérience de soirée gaming".

**Livrables**
- **Realtime** : abonnement Supabase Realtime sur `game_results` et `tournament_players`.
- **Invitations par lien** : `/join/:token` — déjà scaffoldé en mode localStorage.
- **Notifications email** (Resend, déjà disponible dans les MCPs).
- **Préférences notification** dans le profil.

---

## Phase 3 — Formats de tournoi (4-5 jours) — ✅ LIVRÉ

**Constat actuel** : le modèle "tout le monde joue, on classe par rang, on additionne les points" marche pour Mario Kart, Just Dance, Quiz. Mais pas pour FIFA en 1v1.

**Livré** : `lib/formats.ts` implémente round_robin, single_elim, double_elim, swiss. `components/tournament/Bracket.tsx` rend le bracket en SVG avec matches cliquables.

---

## Phase 4 — Mode live + PWA + mobile UX (2-3 jours) — ✅ LIVRÉ

**Livré** :
- `/tournois/[id]/live` plein écran, carrousel auto entre podium / classement / progression.
- `app/manifest.ts` + 3 icons PWA (192, 512, maskable) via `ImageResponse`.

---

## Phase 5 — Social & engagement (3-4 jours) — ✅ LIVRÉ (partiel)

**Livré** :
- 6 templates de tournoi (`lib/templates.ts`) accessibles dans `/creer`.
- 10 badges calculés (`lib/badges.ts`) affichés sur `/profil`.
- OG image dynamique pour `/` et `/tournois/[id]`.

**Reste** : chat realtime, photo upload, export PDF (lib `@react-pdf/renderer` installée).

---

## Phase 6 — Production readiness (2-3 jours) — ✅ LIVRÉ (partiel)

**Livré** :
- Tests Playwright e2e (`tests/e2e/smoke.spec.ts`).
- Focus trap dans `Modal.tsx`.
- `app/sitemap.ts`, `app/robots.ts`, `app/legal/page.tsx`.

**Reste** : Sentry, Vercel Analytics, audit a11y axe-core, i18n, rate limiting.

---

## Phase 7 — Monétisation & scale (optionnel)

Seulement si les chiffres confirment qu'il y a un usage.

---

## ✅ Definition of "production-ready"

- [ ] Phases 0, 1, 2, 6 toutes complètes
- [ ] Au moins 5 tournois réels joués par des utilisateurs externes
- [ ] Score Lighthouse mobile ≥ 90 sur 3 pages clés
- [ ] 7 jours sans erreur Sentry sérieuse
- [ ] Mentions légales + procédure RGPD en place
- [ ] Email transactionnel testé et délivrable (SPF/DKIM/DMARC verts)
