-- Cached on-chain AMG reflection totals. Public chain data, not per-user secrets.
create table if not exists reward_snapshots (
  id text primary key,
  launched boolean not null default false,
  token text,
  total_usdc_distributed numeric not null default 0,
  total_usdc_withdrawn numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists wallet_reward_cache (
  address text primary key,
  amg_raw text not null default '0',
  amg_human numeric not null default 0,
  earned_usdc numeric not null default 0,
  claimed_usdc numeric not null default 0,
  claimable_usdc numeric not null default 0,
  updated_at timestamptz not null default now()
);
