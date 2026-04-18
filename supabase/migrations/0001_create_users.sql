create table users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index users_clerk_id_idx on users(clerk_id);
