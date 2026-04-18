create table tracks (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  s3_key text not null,
  org_id uuid references organizations(id) on delete cascade not null,
  uploaded_by uuid references users(id) on delete set null,
  created_at timestamp with time zone default now()
);

create index tracks_org_id_idx on tracks(org_id);
