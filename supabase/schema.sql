-- ============================================================
-- Olymp'Game — Schéma Supabase / PostgreSQL
-- À exécuter dans le SQL Editor de Supabase (project settings).
-- Idempotent : peut être relancé sans casse.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES (1-1 avec auth.users)
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_initial text not null default '?',
  color text not null default '#0085C7',
  joined_at timestamptz not null default now()
);

-- Auto-création du profil au signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_initial)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    upper(left(coalesce(new.raw_user_meta_data->>'name', new.email), 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. TOURNAMENTS
-- ============================================================

create table if not exists public.tournaments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text default '',
  banner_emoji text default '🏆',
  created_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'open' check (status in ('open','in_progress','completed')),
  start_date date,
  max_players int not null default 12,
  created_at timestamptz not null default now()
);

create index if not exists idx_tournaments_created_by on public.tournaments(created_by);
create index if not exists idx_tournaments_status on public.tournaments(status);

-- ============================================================
-- 3. ORGANIZERS & PLAYERS (relations)
-- ============================================================

create table if not exists public.tournament_organizers (
  tournament_id uuid references public.tournaments(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  primary key (tournament_id, profile_id)
);

create table if not exists public.tournament_players (
  tournament_id uuid references public.tournaments(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (tournament_id, profile_id)
);

-- ============================================================
-- 4. GAMES
-- ============================================================

create table if not exists public.games (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null,
  emoji text default '🎮',
  format text not null default 'ranked'
    check (format in ('ranked','round_robin','single_elim','double_elim','swiss')),
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_games_tournament on public.games(tournament_id);

-- Barème de points par jeu
create table if not exists public.game_points (
  game_id uuid references public.games(id) on delete cascade,
  rank int not null,
  points int not null default 0,
  primary key (game_id, rank)
);

-- Résultats classés (format 'ranked' uniquement)
create table if not exists public.game_results (
  game_id uuid references public.games(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  rank int not null,
  primary key (game_id, profile_id)
);

-- Matches (formats non-ranked)
create table if not exists public.matches (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid not null references public.games(id) on delete cascade,
  round int not null,
  position int not null,
  bracket text check (bracket in ('winners','losers','finals')),
  player_a uuid references public.profiles(id) on delete set null,
  player_b uuid references public.profiles(id) on delete set null,
  score_a int,
  score_b int,
  winner_id uuid references public.profiles(id) on delete set null,
  next_match_id uuid references public.matches(id) on delete set null,
  next_loser_match_id uuid references public.matches(id) on delete set null
);

create index if not exists idx_matches_game on public.matches(game_id);

-- ============================================================
-- 5. INVITATIONS (Phase 2)
-- ============================================================

create table if not exists public.invitations (
  token uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz,
  max_uses int default null, -- null = illimité
  uses int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_invitations_tournament on public.invitations(tournament_id);

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_organizers enable row level security;
alter table public.tournament_players enable row level security;
alter table public.games enable row level security;
alter table public.game_points enable row level security;
alter table public.game_results enable row level security;
alter table public.matches enable row level security;
alter table public.invitations enable row level security;

-- Profiles : tout le monde peut lire, seul le propriétaire peut écrire
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (true);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

-- Tournaments : lecture publique, mutations réservées aux organisateurs
drop policy if exists tournaments_select on public.tournaments;
create policy tournaments_select on public.tournaments
  for select using (true);
drop policy if exists tournaments_insert on public.tournaments;
create policy tournaments_insert on public.tournaments
  for insert with check (auth.uid() = created_by);
drop policy if exists tournaments_update_orga on public.tournaments;
create policy tournaments_update_orga on public.tournaments
  for update using (
    exists (
      select 1 from public.tournament_organizers o
      where o.tournament_id = id and o.profile_id = auth.uid()
    )
  );
drop policy if exists tournaments_delete_creator on public.tournaments;
create policy tournaments_delete_creator on public.tournaments
  for delete using (auth.uid() = created_by);

-- Organizers : lecture publique, ajout par orgas, suppression par créateur
drop policy if exists organizers_select on public.tournament_organizers;
create policy organizers_select on public.tournament_organizers
  for select using (true);
drop policy if exists organizers_manage on public.tournament_organizers;
create policy organizers_manage on public.tournament_organizers
  for all using (
    exists (
      select 1 from public.tournaments t
      where t.id = tournament_id and t.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.tournaments t
      where t.id = tournament_id and t.created_by = auth.uid()
    )
  );

-- Players : self-service insert/delete, lecture publique
drop policy if exists players_select on public.tournament_players;
create policy players_select on public.tournament_players
  for select using (true);
drop policy if exists players_join_self on public.tournament_players;
create policy players_join_self on public.tournament_players
  for insert with check (auth.uid() = profile_id);
drop policy if exists players_leave_self on public.tournament_players;
create policy players_leave_self on public.tournament_players
  for delete using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.tournament_organizers o
      where o.tournament_id = tournament_id and o.profile_id = auth.uid()
    )
  );

-- Games / points / results / matches : gérés par orgas, lus par tous
drop policy if exists games_select on public.games;
create policy games_select on public.games for select using (true);
drop policy if exists games_manage on public.games;
create policy games_manage on public.games
  for all using (
    exists (
      select 1 from public.tournament_organizers o
      where o.tournament_id = games.tournament_id and o.profile_id = auth.uid()
    )
  );

drop policy if exists game_points_select on public.game_points;
create policy game_points_select on public.game_points for select using (true);
drop policy if exists game_points_manage on public.game_points;
create policy game_points_manage on public.game_points
  for all using (
    exists (
      select 1 from public.games g
      join public.tournament_organizers o on o.tournament_id = g.tournament_id
      where g.id = game_id and o.profile_id = auth.uid()
    )
  );

drop policy if exists game_results_select on public.game_results;
create policy game_results_select on public.game_results for select using (true);
drop policy if exists game_results_manage on public.game_results;
create policy game_results_manage on public.game_results
  for all using (
    exists (
      select 1 from public.games g
      join public.tournament_organizers o on o.tournament_id = g.tournament_id
      where g.id = game_id and o.profile_id = auth.uid()
    )
  );

drop policy if exists matches_select on public.matches;
create policy matches_select on public.matches for select using (true);
drop policy if exists matches_manage on public.matches;
create policy matches_manage on public.matches
  for all using (
    exists (
      select 1 from public.games g
      join public.tournament_organizers o on o.tournament_id = g.tournament_id
      where g.id = game_id and o.profile_id = auth.uid()
    )
  );

drop policy if exists invitations_select on public.invitations;
create policy invitations_select on public.invitations for select using (true);
drop policy if exists invitations_manage on public.invitations;
create policy invitations_manage on public.invitations
  for all using (
    exists (
      select 1 from public.tournament_organizers o
      where o.tournament_id = invitations.tournament_id and o.profile_id = auth.uid()
    )
  );

-- ============================================================
-- 7. REALTIME (à activer dans le Dashboard Supabase)
-- ============================================================

-- Dans Database > Replication, activer pour les tables :
-- tournaments, tournament_players, games, game_results, matches
-- Ça permettra les subscriptions en temps réel côté client.
