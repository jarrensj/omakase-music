create table track_notes (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  track_id uuid references tracks(id) on delete cascade not null,
  author_id uuid references users(id) on delete cascade not null,
  created_at timestamp with time zone default now()
);

create index track_notes_track_id_idx on track_notes(track_id);
