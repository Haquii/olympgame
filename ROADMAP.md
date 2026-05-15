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

**Schéma cible (PostgreSQL)**

```sql
-- gérés par Supabase Auth
users (id uuid, email, ...)

profiles (
  id uuid pk references users(id),
  name text, avatar_initial text, color text, joined_at timestamptz
)

tournaments (
  id uuid pk, name text, description text, banner_emoji text,
  created_by uuid references profiles(id),
  status text check (status in ('open','in_progress','completed')),
  start_date date, max_players int,
  created_at timestamptz
)

tournament_organizers (tournament_id, profile_id, primary key)
tournament_players  (tournament_id, profile_id, joined_at, primary key)

games (
  id uuid pk, tournament_id uuid references tournaments(id),
  name text, emoji text, position int
)

game_points (game_id uuid, rank int, points int, primary key)

game_results (game_id uuid, profile_id uuid, rank int, primary key)

-- Phase 3 ajoutera rounds/matches pour les brackets
```

**Politiques RLS**
- Tournoi lisible par tous (catalogue public).
- Mutation tournoi : `auth.uid() IN tournament_organizers WHERE tournament_id = id`.
- Inscription joueur : self-service tant que `players.count < max_players`.

**Côté Next.js**
- Server Actions pour toutes les mutations (`createTournament`, `joinTournament`, etc.).
- `@supabase/ssr` pour l'auth cookie-based dans App Router.
- TanStack Query pour le cache + invalidations.
- Le store Zustand devient un cache UI éphémère (filtres, drafts de formulaire) ; les données serveur passent par React Query.

**Migration depuis localStorage**
- Au premier login, si `localStorage.olympgame_v1` existe → propose à l'utilisateur d'importer ses données. Utile pour mes données de dev et celles des early adopters.

**Definition of done**
- Je crée un tournoi sur mon laptop, ma sœur le voit depuis son iPhone après login Google.
- Tests d'intégration sur les Server Actions (Vitest).
- Sentry et Vercel Analytics branchés.

---

## Phase 2 — Realtime + invitations + emails (2-3 jours)

Ce qui transforme "outil de gestion" en "expérience de soirée gaming".

**Livrables**
- **Realtime** : abonnement Supabase Realtime sur `game_results` et `tournament_players`. Quand un orga saisit un score, le classement bouge en live sur les écrans des autres. Idem pour les inscriptions.
- **Invitations par lien** : `/join/:token` — token UUID stocké en DB lié au tournoi, expiration optionnelle, usage unique ou multiple. Pas besoin que l'invité ait un compte ; le clic l'envoie sur le signup avec auto-join au tournoi cible.
- **Notifications email** (Resend, déjà disponible dans les MCPs) :
  - Nouveau co-organisateur ajouté → email "tu es maintenant orga de X"
  - Tournoi démarre demain → reminder J-1 aux joueurs inscrits
  - Résultat publié → si tu n'es pas sur l'app, email récap "voici les scores de Mario Kart"
- **Préférences notification** dans le profil (un toggle par type d'email).

**Decision : pas de push notifications mobiles pour l'instant.** Trop de friction (permission browser, service worker). On y vient en phase 4 si la PWA prend.

**Definition of done**
- Deux navigateurs ouverts sur la même page tournoi : la saisie d'un score se voit sur les deux sans refresh, en <500ms.
- L'invitation par lien marche pour un utilisateur déconnecté.

---

## Phase 3 — Formats de tournoi (4-5 jours)

**Constat actuel** : le modèle "tout le monde joue, on classe par rang, on additionne les points" marche pour Mario Kart, Just Dance, Quiz. Mais pas pour FIFA en 1v1, ni pour un cup type Coupe du Monde.

**Refonte du data model**

Aujourd'hui `Game = un jeu + des résultats par rang`. Demain `Game = un format` qui contient :

```
Game {
  format: 'ranked' | 'round_robin' | 'single_elim' | 'double_elim' | 'swiss'
  rounds: Round[]
}
Round {
  matches: Match[]  // Pour 'ranked', 1 seul match avec tous les joueurs
}
Match {
  players: ProfileId[]
  scores: { profile_id, score, rank? }[]
  status: 'pending' | 'in_progress' | 'completed'
}
```

Le mode `ranked` actuel devient un cas particulier (1 round, 1 match, tous les joueurs). Migration auto sans casser les tournois existants.

**Algorithmes à implémenter** (dans `lib/formats/`)
- `roundRobinPairings(players)` — chaque joueur affronte tous les autres.
- `singleElimBracket(players)` — bracket à élimination directe, gestion des byes pour les puissances non-2.
- `doubleElim` — bracket double avec losers' bracket.
- `swissPairings(players, roundN, history)` — appariement par rang accumulé, sans rejouer.

**UI bracket**
- Composant custom (pas de lib) avec SVG + Tailwind. Olympique = des médailles, donc une vraie identité visuelle compte.
- Mode horizontal desktop, vertical mobile.
- Match cliquable → modal de saisie de score.

**Definition of done**
- Je crée un tournoi FIFA en élimination directe à 8 joueurs et je peux suivre le bracket jusqu'à la finale.
- Le système de points global du tournoi reste cohérent (un Game = X points totaux distribués selon le format).

---

## Phase 4 — Mode live + PWA + mobile UX (2-3 jours)

**Mode live (écran TV)**

Page `/tournois/:id/live` :
- Plein écran, sans nav ni footer.
- Podium géant qui se met à jour en live.
- Carrousel auto entre podium / dernier match / classement complet.
- Animation quand un score change (médaille qui scintille).
- Cas d'usage : on branche le laptop sur la télé pendant la soirée.

**PWA**
- `manifest.json` + icons (192, 512, maskable).
- Service worker minimal via `next-pwa` : cache des assets statiques, fallback offline sur la page d'accueil.
- Bouton "Installer Olymp'Game" qui apparaît sur mobile compatible.

**Mobile UX — refonte ciblée**
- **Saisie résultat** : aujourd'hui c'est un `<select>` par joueur. Sur mobile, drag-and-drop des joueurs dans l'ordre = 10x mieux.
- **Création tournoi** : les 3 étapes fonctionnent, mais l'étape "jeux" sur mobile = bouton "+" plus visible, sélecteur popularGames en bottom-sheet plutôt qu'inline.
- **Modales** : aujourd'hui centrées. Sur mobile, devenir des bottom-sheets full-width.

**Definition of done**
- Test sur iPhone & Android (Chrome) : tout est tappable confortablement avec le pouce.
- Installation PWA testée sur iOS Safari + Android Chrome.
- Lighthouse mobile score ≥ 90 sur les 4 axes.

---

## Phase 5 — Social & engagement (3-4 jours)

Ce qui fait revenir.

**Livrables**
- **Chat / banter feed par tournoi** : timeline simple, message + emoji, pas de DMs. Coût Supabase : table `tournament_messages`. UI = sidebar sur desktop, onglet sur mobile.
- **Photo upload** : Supabase Storage. Une photo par match ("preuve" du score), une photo de podium. Vercel Blob est aussi une option si on veut rester full-Vercel.
- **Achievements / badges** : 5 médailles d'or, 3 tournois organisés, 1er top 3, 10 jeux joués. Calculés à la volée, affichés sur le profil.
- **Templates de tournoi** : "Soirée Mario Party", "FIFA Cup 8 joueurs", "Olympiades été" — 1 clic et le tournoi est pré-rempli (jeux + barème + format). Réduit la création de 2 min à 20 sec.
- **OG image dynamique** : `app/tournois/[id]/opengraph-image.tsx` qui rend l'emoji + nom + podium courant en image. Partage Discord/WhatsApp = preview belle.
- **Export PDF podium** : à la fin d'un tournoi, bouton "Télécharger le diplôme" avec le podium, dates, et signatures des orgas. Utilise `@react-pdf/renderer`.

**Definition of done**
- Le chat marche en realtime entre 2 navigateurs.
- Une image partagée sur WhatsApp s'affiche avec preview correcte.
- Le diplôme PDF a fière allure imprimé en A4.

---

## Phase 6 — Production readiness (2-3 jours)

Avant d'ouvrir aux 4 vents.

**Livrables**
- **Tests Playwright e2e** : 3 scénarios critiques (signup → créer tournoi → ajouter joueur → saisir score → vérifier classement / rejoindre via lien d'invitation / saisir résultat en realtime entre 2 sessions).
- **Sentry** : capture des erreurs front + back, source maps, alerting Slack/email.
- **Vercel Analytics + Speed Insights** : RUM (Real User Monitoring), pour voir comment l'app se comporte vraiment chez les utilisateurs.
- **Audit a11y complet** : axe-core via Playwright, fix focus traps dans modales, ARIA sur les composants custom (tabs, brackets), contrastes vérifiés en mode hero (texte blanc sur gradient — à border-test).
- **i18n** : `next-intl`, extraction des strings FR, traduction EN. Décision sur les autres langues plus tard selon traction.
- **SEO** : sitemap XML dynamique, robots.txt, métadonnées par page (titre tournoi, OG, description).
- **Mentions légales + RGPD** : page `/legal`, cookie consent minimal (Vercel Analytics est anonyme donc pas de bandeau lourd nécessaire), procédure de suppression de compte.
- **Rate limiting** : Vercel KV + middleware sur les mutations sensibles (création de tournoi, invitations).

**Definition of done**
- 0 erreur Sentry pendant 7 jours sur trafic test.
- Score Lighthouse desktop ≥ 95 / mobile ≥ 90.
- Audit a11y axe : 0 violation critique ou sérieuse.

---

## Phase 7 — Monétisation & scale (optionnel, à décider après les vraies stats)

Seulement si les chiffres confirment qu'il y a un usage. Pas un objectif en soi.

**Pistes**
- **Découverte de tournois publics** : `/explore`, classement des tournois les plus joués cette semaine, leaderboard global par jeu.
- **Olymp'Game Pro** (Stripe, abonnement individuel ~3€/mois ou tournoi ponctuel ~5€) :
  - Tournois >16 joueurs (limite gratuite).
  - Custom branding (logo, couleurs, photo de bannière).
  - Export Excel des résultats.
  - Stats avancées par joueur.
- **Tournois sponsorisés** : marques gaming (clavier, manettes) sponsorisent un tournoi → leur logo sur le diplôme PDF + l'écran live. Modèle B2B simple.
- **API publique** : endpoints REST pour les vrais nerds qui veulent intégrer leurs résultats sur leur site / Discord bot.

**Indicateurs déclencheurs**
- > 100 tournois créés par mois.
- > 30% de retention sur 30 jours.
- Au moins 5 demandes spontanées du type "comment je débloque plus de joueurs".

Sans ça, on optimise le produit avant de monétiser.

---

## 🚦 Ordre de bataille recommandé

1. **Cette semaine** : Phase 0 + démarrer Phase 1.
2. **Semaine 2-3** : Finir Phase 1, demo en interne sur 4-5 amis.
3. **Semaine 4** : Phase 2 → première vraie soirée gaming utilisable.
4. **Semaine 5-6** : Phase 3 OU Phase 4 selon les retours des amis.
5. **Avant ouverture publique** : Phase 6 obligatoire.

Phases 5, 7 = quand le produit a prouvé son intérêt.

---

## 🧰 Stack consolidée après Phase 1

| Couche                | Choix                          | Coût mensuel à 100 utilisateurs |
|-----------------------|---------------------------------|---------------------------------|
| Hébergement           | Vercel (Hobby ou Pro)          | 0 € / 20 €                      |
| DB + Auth + Realtime  | Supabase (Free ou Pro)         | 0 € / 25 €                      |
| Storage (photos)      | Supabase Storage               | inclus                          |
| Email transactionnel  | Resend                         | 0 € (3k emails/mois gratuits)   |
| Error tracking        | Sentry (Free)                  | 0 €                             |
| Analytics             | Vercel Analytics + Speed       | inclus dans Pro                 |
| **Total**             |                                | **0 €** dev, **~45 €** prod    |

---

## 🚧 Risques identifiés & mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Supabase quota Free dépassé en cas de viralité | Moyenne | Service down | Alerting sur usage à 70% + plan Pro prêt à activer |
| Realtime ne scale pas au-delà de 200 connexions concurrentes | Faible | UX dégradée | Fallback polling 5s en cas d'erreur subscription |
| Migration data model phase 3 casse les tournois existants | Moyenne | Perte de données | Migration script + backup auto + dry-run sur staging |
| Spam / création abusive de tournois | Faible | Coûts DB | Rate limiting phase 6 + captcha si nécessaire |
| RGPD : photos uploadées | Moyenne | Légal | TOS clair, procédure de suppression sous 30j, pas de photos sans consentement explicite |

---

## ✅ Definition of "production-ready"

Le produit est prêt à être partagé publiquement (Reddit, Product Hunt, Twitter) quand :

- [ ] Phases 0, 1, 2, 6 toutes complètes
- [ ] Au moins 5 tournois réels joués par des utilisateurs externes à l'équipe
- [ ] Score Lighthouse mobile ≥ 90 sur 3 pages clés
- [ ] 7 jours sans erreur Sentry sérieuse
- [ ] Mentions légales + procédure RGPD en place
- [ ] Email transactionnel testé et délivrable (SPF/DKIM/DMARC verts)

Sans ces 6 critères, on continue à itérer en privé.
