create or replace function sync_pull(since_server_time timestamptz)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_since timestamptz := coalesce(since_server_time, '1970-01-01T00:00:00Z'::timestamptz);
  v_now timestamptz := timezone('utc', now());
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  return jsonb_build_object(
    'sessions', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'ownerUserId', owner_user_id,
            'createdAt', created_at,
            'updatedAt', updated_at,
            'deletedAt', deleted_at,
            'version', version,
            'serverUpdatedAt', server_updated_at,
            'isDirty', false,
            'lastSyncedAt', server_updated_at,
            'date', date,
            'splitType', split_type,
            'workoutType', workout_type,
            'workoutLabel', workout_label,
            'durationMin', duration_min,
            'notes', notes
          )
        )
        from training_sessions
        where owner_user_id = auth.uid()
          and server_updated_at > v_since
      ),
      '[]'::jsonb
    ),
    'exercise_sets', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'ownerUserId', owner_user_id,
            'createdAt', created_at,
            'updatedAt', updated_at,
            'deletedAt', deleted_at,
            'version', version,
            'serverUpdatedAt', server_updated_at,
            'isDirty', false,
            'lastSyncedAt', server_updated_at,
            'sessionId', session_id,
            'date', date,
            'splitType', split_type,
            'workoutType', workout_type,
            'exerciseName', exercise_name,
            'exerciseOrder', exercise_order,
            'setOrder', set_order,
            'weightKg', weight_kg,
            'reps', reps,
            'rpe', rpe,
            'rir', rir,
            'technique', technique
          )
        )
        from exercise_set_logs
        where owner_user_id = auth.uid()
          and server_updated_at > v_since
      ),
      '[]'::jsonb
    ),
    'readiness_logs', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'ownerUserId', owner_user_id,
            'createdAt', created_at,
            'updatedAt', updated_at,
            'deletedAt', deleted_at,
            'version', version,
            'serverUpdatedAt', server_updated_at,
            'isDirty', false,
            'lastSyncedAt', server_updated_at,
            'date', date,
            'sleepHours', sleep_hours,
            'sleepQuality', sleep_quality,
            'stress', stress,
            'pain', pain,
            'readinessScore', readiness_score,
            'notes', notes
          )
        )
        from readiness_logs
        where owner_user_id = auth.uid()
          and server_updated_at > v_since
      ),
      '[]'::jsonb
    ),
    'weight_logs', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'ownerUserId', owner_user_id,
            'createdAt', created_at,
            'updatedAt', updated_at,
            'deletedAt', deleted_at,
            'version', version,
            'serverUpdatedAt', server_updated_at,
            'isDirty', false,
            'lastSyncedAt', server_updated_at,
            'date', date,
            'weightKg', weight_kg,
            'notes', notes
          )
        )
        from weight_logs
        where owner_user_id = auth.uid()
          and server_updated_at > v_since
      ),
      '[]'::jsonb
    ),
    'recommendations', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'ownerUserId', owner_user_id,
            'createdAt', created_at,
            'updatedAt', updated_at,
            'deletedAt', deleted_at,
            'version', version,
            'serverUpdatedAt', server_updated_at,
            'isDirty', false,
            'lastSyncedAt', server_updated_at,
            'date', date,
            'splitType', split_type,
            'workoutType', workout_type,
            'kind', kind,
            'status', status,
            'message', message,
            'reason', reason
          )
        )
        from recommendations
        where owner_user_id = auth.uid()
          and server_updated_at > v_since
      ),
      '[]'::jsonb
    ),
    'app_settings', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'ownerUserId', owner_user_id,
            'createdAt', created_at,
            'updatedAt', updated_at,
            'deletedAt', deleted_at,
            'version', version,
            'serverUpdatedAt', server_updated_at,
            'isDirty', false,
            'lastSyncedAt', server_updated_at,
            'key', key,
            'value', value
          )
        )
        from app_settings
        where owner_user_id = auth.uid()
          and server_updated_at > v_since
      ),
      '[]'::jsonb
    ),
    'server_time', v_now
  );
end;
$$;
