create table if not exists user_credits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null unique,
  credits    integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_credits enable row level security;

create policy "Users can view own credits"
  on user_credits for select
  using (auth.uid() = user_id);

-- Trigger: give 1 free credit on first signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.user_credits (user_id, credits)
  values (new.id, 1);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
