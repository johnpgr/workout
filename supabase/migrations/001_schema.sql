create table if not exists training_sessions (
  id text primary key,
  owner_user_id uuid not null default auth.uid(),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  version integer not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  date date not null,
  split_type text not null,
  workout_type text not null,
  workout_label text not null,
  duration_min integer not null,
  notes text not null
);

create table if not exists exercise_set_logs (
  id text primary key,
  owner_user_id uuid not null default auth.uid(),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  version integer not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  session_id text not null,
  date date not null,
  split_type text not null,
  workout_type text not null,
  exercise_name text not null,
  exercise_order integer not null,
  set_order integer not null,
  weight_kg numeric not null,
  reps integer not null,
  rpe numeric,
  rir numeric,
  technique text
);

create table if not exists readiness_logs (
  id text primary key,
  owner_user_id uuid not null default auth.uid(),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  version integer not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  date date not null,
  sleep_hours numeric not null,
  sleep_quality integer not null,
  stress integer not null,
  pain integer not null,
  readiness_score integer not null,
  notes text not null
);

create table if not exists weight_logs (
  id text primary key,
  owner_user_id uuid not null default auth.uid(),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  version integer not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  date date not null,
  weight_kg numeric not null,
  notes text not null
);

create table if not exists recommendations (
  id text primary key,
  owner_user_id uuid not null default auth.uid(),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  version integer not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  date date not null,
  split_type text,
  workout_type text,
  kind text not null,
  status text not null,
  message text not null,
  reason text not null
);

create table if not exists app_settings (
  id text primary key,
  owner_user_id uuid not null default auth.uid(),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  version integer not null,
  server_updated_at timestamptz not null default timezone('utc', now()),
  key text not null,
  value text not null,
  unique (owner_user_id, key)
);

create index if not exists idx_training_sessions_owner_server_updated
  on training_sessions (owner_user_id, server_updated_at);

create index if not exists idx_exercise_set_logs_owner_server_updated
  on exercise_set_logs (owner_user_id, server_updated_at);

create index if not exists idx_readiness_logs_owner_server_updated
  on readiness_logs (owner_user_id, server_updated_at);

create index if not exists idx_weight_logs_owner_server_updated
  on weight_logs (owner_user_id, server_updated_at);

create index if not exists idx_recommendations_owner_server_updated
  on recommendations (owner_user_id, server_updated_at);

create index if not exists idx_app_settings_owner_server_updated
  on app_settings (owner_user_id, server_updated_at);
