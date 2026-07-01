create table if not exists public.teams (
  id uuid primary key,
  name text not null,
  abbreviation text not null unique,
  logo_url text
);

create table if not exists public.eras (
  id uuid primary key,
  label text not null unique,
  start_year integer not null,
  end_year integer not null,
  constraint eras_valid_year_range check (start_year <= end_year)
);

create table if not exists public.players (
  id uuid primary key,
  name text not null,
  position text not null,
  height_inches integer not null check (height_inches > 0),
  weight_lbs integer not null check (weight_lbs > 0),
  image_url text
);

create table if not exists public.player_versions (
  id uuid primary key,
  player_id uuid not null references public.players(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  era_id uuid not null references public.eras(id) on delete restrict,
  label text not null,
  season_start integer not null,
  season_end integer not null,
  constraint player_versions_valid_season_range check (season_start <= season_end),
  constraint player_versions_unique_label unique (player_id, team_id, era_id, label)
);

create table if not exists public.player_attributes (
  id uuid primary key,
  player_version_id uuid not null unique references public.player_versions(id) on delete cascade,
  athleticism smallint not null check (athleticism between 0 and 100),
  shooting smallint not null check (shooting between 0 and 100),
  finishing smallint not null check (finishing between 0 and 100),
  playmaking smallint not null check (playmaking between 0 and 100),
  defense smallint not null check (defense between 0 and 100)
);

create index if not exists player_versions_team_era_idx
  on public.player_versions(team_id, era_id);

create index if not exists player_versions_player_idx
  on public.player_versions(player_id);

create index if not exists player_attributes_player_version_idx
  on public.player_attributes(player_version_id);

grant select on table public.teams to anon, authenticated;
grant select on table public.eras to anon, authenticated;
grant select on table public.players to anon, authenticated;
grant select on table public.player_versions to anon, authenticated;
grant select on table public.player_attributes to anon, authenticated;
