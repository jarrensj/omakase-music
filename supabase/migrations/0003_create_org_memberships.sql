create type org_role as enum ('owner', 'member');

create table org_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  org_id uuid references organizations(id) on delete cascade not null,
  role org_role not null default 'member',
  created_at timestamp with time zone default now(),
  unique(user_id, org_id)
);

create index org_memberships_user_id_idx on org_memberships(user_id);
create index org_memberships_org_id_idx on org_memberships(org_id);
