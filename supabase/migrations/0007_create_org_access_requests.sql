create table org_access_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(org_id, user_id)
);

create index org_access_requests_org_id_idx on org_access_requests(org_id);
create index org_access_requests_user_id_idx on org_access_requests(user_id);
