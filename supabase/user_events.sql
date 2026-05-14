-- User activity analytics table
-- Tracks searches, analyses, and logins for all users (anonymous + logged in)

CREATE TABLE IF NOT EXISTS user_events (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  event       text        NOT NULL,   -- 'search' | 'analysis' | 'login'
  data        jsonb       DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_events_user_id_idx   ON user_events(user_id);
CREATE INDEX IF NOT EXISTS user_events_event_idx      ON user_events(event);
CREATE INDEX IF NOT EXISTS user_events_created_at_idx ON user_events(created_at);

-- Service role writes via API routes; no direct client access needed
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
