# 🏆 Olymp'Game

Plateforme de tournois multi-jeux vidéo entre amis. Gratuit, fun, configurable. Crée un tournoi, invite des co-organisateurs, choisis tes jeux, fixe ton barème de points, suis le classement en direct.

Application **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Zustand**, prête à déployer sur **Vercel** en un clic. Données persistées côté client en `localStorage` — aucun backend requis.

---

## 🚀 Déploiement sur Vercel

### Option 1 — En un clic depuis Git

1. Pousse le projet sur un repo GitHub / GitLab / Bitbucket.
2. Va sur [vercel.com/new](https://vercel.com/new) et importe le repo.
3. Vercel détecte automatiquement Next.js. Clique sur **Deploy**. C'est tout.

### Option 2 — Vercel CLI

```bash
npm install -g vercel
vercel            # déploiement preview
vercel --prod     # déploiement production
```

Aucune variable d'environnement nécessaire.

---

## 🛠️ Développement local

Prérequis : **Node.js 18.17+** (recommandé 20+).

```bash
npm install
npm run dev       # http://localhost:3000
```

Autres scripts :

```bash
npm run build     # build de production
npm run start     # serveur production (après build)
npm run lint      # vérif ESLint Next
```

---

## 🧱 Stack & choix techniques

| Couche             | Tech                              | Pourquoi                                                       |
| ------------------ | --------------------------------- | -------------------------------------------------------------- |
| Framework          | Next.js 14 (App Router)           | SSR/SSG natifs, déploiement Vercel zero-config                 |
| Langage            | TypeScript strict                 | Sécurité de typage, autocomplete partout                       |
| UI                 | Tailwind CSS 3 + composants maison | Design system olympique, zero runtime CSS                      |
| State management   | Zustand 4 + `persist`              | Léger (~1 kB), pas de provider, persistance localStorage native |
| Persistance        | `localStorage` (clé `olympgame_v1`) | Démarrage immédiat, pas de DB à provisionner                  |
| Police             | Bebas Neue + Inter (Google Fonts) | Style sportif / lisibilité                                     |

> Le store Zustand est conçu pour pouvoir être remplacé plus tard par un backend (Postgres + Vercel KV, Supabase, etc.) sans toucher aux composants — il suffit de remapper les actions sur des fetchs API.

---

## 📂 Arborescence

```
.
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Layout racine (nav, toasts, footer)
│   ├── page.tsx                  # / — Hero + features + tournois en vedette
│   ├── globals.css               # Tailwind + design tokens custom
│   ├── tournois/
│   │   ├── page.tsx              # /tournois — liste filtrable
│   │   └── [id]/
│   │       └── page.tsx          # /tournois/:id — détail avec 5 onglets
│   ├── creer/page.tsx            # /creer — assistant 3 étapes
│   └── profil/page.tsx           # /profil — inscription + stats + historique
├── components/
│   ├── Nav.tsx                   # Barre de navigation sticky
│   ├── Footer.tsx                # Footer avec anneaux olympiques
│   ├── Avatar.tsx                # Avatar coloré (initial + couleur perso)
│   ├── StatusBadge.tsx           # Badge de statut tournoi
│   ├── TournamentCard.tsx        # Carte tournoi (utilisée partout)
│   ├── RankRow.tsx               # Ligne de classement (or/argent/bronze)
│   ├── Modal.tsx                 # Modale réutilisable
│   ├── ToastHost.tsx             # Toasts globaux
│   ├── PointsEditor.tsx          # Éditeur de barème de points
│   ├── Empty.tsx                 # État vide générique
│   └── tournament/
│       ├── TabApercu.tsx         # Onglet "Aperçu"
│       ├── TabRanking.tsx        # Onglet "Classement"
│       ├── TabGames.tsx          # Onglet "Jeux & Points" + modales
│       ├── TabPlayers.tsx        # Onglet "Joueurs"
│       └── TabOrga.tsx           # Onglet "Organisation"
├── lib/
│   ├── types.ts                  # Types TypeScript du domaine
│   ├── utils.ts                  # Constantes (jeux populaires, points par défaut), helpers
│   ├── seed.ts                   # Données de démo (8 joueurs, 3 tournois)
│   ├── ranking.ts                # Calcul classement + progression
│   └── store.ts                  # Store Zustand persisté + toasts + hooks
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── vercel.json
└── package.json
```

---

## 🎮 Fonctionnalités

- **Profils joueurs** : inscription par pseudo, avatar coloré personnalisable, stats cumulées (points, médailles or/argent/bronze).
- **Création de tournoi en 3 étapes** : infos générales → choix des jeux (12 jeux populaires + custom) → ajout de co-organisateurs.
- **Co-organisateurs** : ajout / retrait, droits étendus (gérer jeux, joueurs, résultats). Le créateur ne peut pas être retiré.
- **Système de points** : barème olympique 10/7/5/3/2/1 par défaut, totalement personnalisable par jeu (ajout/retrait de places).
- **Saisie des résultats** : sélection du rang de chaque joueur, recalcul automatique. Effacement en un clic.
- **Classement** : tri par points → or → argent → bronze (tie-breakers olympiques), podium avec médailles, progression du tournoi.
- **Filtres tournois** : ouverts / en cours / terminés.
- **Données de démo** : 8 joueurs, 3 tournois (un en cours avec résultats, un ouvert aux inscriptions, un terminé). Reset depuis le profil.

---

## 🔐 Persistance & sécurité

- Toutes les données vivent dans `localStorage` sous la clé `olympgame_v1`.
- Aucune donnée n'est envoyée à un serveur — l'app est 100% côté client après le rendu initial.
- Pour faire évoluer vers une vraie auth + DB partagée : remplacer le store par des appels API (Vercel Postgres, Supabase, Neon…) et ajouter NextAuth.

---

## 🎨 Design system

Couleurs des anneaux olympiques (Tailwind classes) :

- `oly-blue` `#0085C7` · `oly-yellow` `#F4C300` · `oly-black` `#0A1F2E` · `oly-green` `#009F3D` · `oly-red` `#DF0024`
- Médailles : `gold` · `silver` · `bronze`
- Typo display : **Bebas Neue** (titres impactants) — texte : **Inter**

---

## 📝 Licence

MIT — fais-en ce que tu veux.
