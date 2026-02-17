alter table training_sessions enable row level security;
alter table exercise_set_logs enable row level security;
alter table readiness_logs enable row level security;
alter table weight_logs enable row level security;
alter table recommendations enable row level security;
alter table app_settings enable row level security;

drop policy if exists "Users can only access their own data" on training_sessions;
create policy "Users can only access their own data"
  on training_sessions
  for all
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "Users can only access their own data" on exercise_set_logs;
create policy "Users can only access their own data"
  on exercise_set_logs
  for all
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "Users can only access their own data" on readiness_logs;
create policy "Users can only access their own data"
  on readiness_logs
  for all
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "Users can only access their own data" on weight_logs;
create policy "Users can only access their own data"
  on weight_logs
  for all
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "Users can only access their own data" on recommendations;
create policy "Users can only access their own data"
  on recommendations
  for all
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "Users can only access their own data" on app_settings;
create policy "Users can only access their own data"
  on app_settings
  for all
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());
