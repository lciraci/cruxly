create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  type       text not null check (type in ('general', 'privacy')),
  message    text not null,
  created_at timestamptz default now()
);
