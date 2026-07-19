-- News article archive — every article Cruxly sees gets stored here so the
-- searchable window grows beyond what RSS feeds currently expose.
-- Run this in the Supabase SQL editor (prod and dev projects).

create table if not exists news_articles (
  url text primary key,
  title text not null,
  description text,
  content text,
  source_id text,
  source_name text not null,
  source_bias text,
  source_trust_score numeric,
  source_region text,
  author text,
  image_url text,
  published_at timestamptz not null,
  first_seen_at timestamptz not null default now()
);

create index if not exists news_articles_published_at_idx
  on news_articles (published_at desc);

-- Full-text search over title + description, for archive-backed search (phase 3)
alter table news_articles add column if not exists fts tsvector
  generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) stored;

create index if not exists news_articles_fts_idx
  on news_articles using gin (fts);

-- RLS on with no policies: only the service-role key (server-side) can touch it
alter table news_articles enable row level security;
