-- venues
create table venues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  name_en     text,
  area        text not null,
  address     text,
  capacity    integer,
  website_url text,
  scrape_url  text
);

-- artists
create table artists (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  name_en  text,
  country  text,
  genre    text[]
);

-- events
create type event_status as enum ('active', 'cancelled', 'draft');
create type source_site as enum ('iflyer', 'liquidroom', 'wwwtokyo', 'unit', 'smash', 'manual');

create table events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  venue_id     uuid not null references venues(id) on delete cascade,
  date         date not null,
  open_time    time,
  start_time   time,
  price_min    integer,
  price_max    integer,
  ticket_url   text,
  description  text,
  image_url    text,
  source_url   text,
  source_site  source_site,
  is_touring   boolean not null default false,
  status       event_status not null default 'active',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index events_date_idx on events(date);
create index events_venue_id_idx on events(venue_id);
create index events_status_idx on events(status);
create index events_is_touring_idx on events(is_touring);

-- event_artists (junction)
create table event_artists (
  event_id     uuid not null references events(id) on delete cascade,
  artist_id    uuid not null references artists(id) on delete cascade,
  is_headliner boolean not null default false,
  primary key (event_id, artist_id)
);

-- scrape_logs
create type scrape_status as enum ('success', 'partial', 'error');

create table scrape_logs (
  id            uuid primary key default gen_random_uuid(),
  source_site   source_site not null,
  status        scrape_status not null,
  events_found  integer,
  events_added  integer,
  error_message text,
  executed_at   timestamptz not null default now()
);

-- updated_at auto-update trigger
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_updated_at
  before update on events
  for each row execute procedure update_updated_at();

-- RLS: read-only public access
alter table venues enable row level security;
alter table artists enable row level security;
alter table events enable row level security;
alter table event_artists enable row level security;
alter table scrape_logs enable row level security;

create policy "public read venues"       on venues       for select using (true);
create policy "public read artists"      on artists      for select using (true);
create policy "public read events"       on events       for select using (status = 'active');
create policy "public read event_artists" on event_artists for select using (true);
