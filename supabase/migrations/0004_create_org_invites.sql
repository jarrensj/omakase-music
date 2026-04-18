create table org_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  email text not null,
  invited_by uuid references users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(org_id, email)
);

create index org_invites_email_idx on org_invites(email);
create index org_invites_org_id_idx on org_invites(org_id);
