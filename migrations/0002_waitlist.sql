create table if not exists waitlist (
  id text primary key,
  email text not null unique,
  company text,
  created_at timestamptz not null default now()
);
