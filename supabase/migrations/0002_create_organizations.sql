create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  owner_id uuid references users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index organizations_slug_idx on organizations(slug);
create index organizations_owner_id_idx on organizations(owner_id);
