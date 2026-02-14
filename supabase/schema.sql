-- FollowPulse Database Schema
-- Run this in Supabase SQL Editor to initialize the database

-- =============================================================
-- 1. tracked_users: Top 50 monitored Farcaster users
-- =============================================================
CREATE TABLE IF NOT EXISTS tracked_users (
  fid BIGINT PRIMARY KEY,
  username TEXT,
  display_name TEXT,
  pfp_url TEXT,
  follower_count BIGINT DEFAULT 0,
  following_count BIGINT DEFAULT 0,
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tracked_users_follower_count ON tracked_users (follower_count DESC);

-- =============================================================
-- 2. follow_edges_current: Current snapshot of recent followers
-- =============================================================
CREATE TABLE IF NOT EXISTS follow_edges_current (
  source_fid BIGINT NOT NULL,
  target_fid BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (source_fid, target_fid)
);

CREATE INDEX idx_follow_edges_target ON follow_edges_current (target_fid);

-- =============================================================
-- 3. follow_events: Time-series log of follow/unfollow actions
-- =============================================================
CREATE TABLE IF NOT EXISTS follow_events (
  id BIGSERIAL PRIMARY KEY,
  source_fid BIGINT NOT NULL,
  target_fid BIGINT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('follow', 'unfollow')),
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_follow_events_target_detected ON follow_events (target_fid, detected_at DESC);
CREATE INDEX idx_follow_events_source_detected ON follow_events (source_fid, detected_at DESC);
CREATE INDEX idx_follow_events_detected_at ON follow_events (detected_at);

-- =============================================================
-- 4. user_metrics_hourly: Periodic metrics snapshots
-- =============================================================
CREATE TABLE IF NOT EXISTS user_metrics_hourly (
  fid BIGINT NOT NULL,
  ts_hour TIMESTAMPTZ NOT NULL,
  follower_count BIGINT DEFAULT 0,
  following_count BIGINT DEFAULT 0,
  casts_count BIGINT DEFAULT 0,
  reactions_received BIGINT DEFAULT 0,
  mentions_received BIGINT DEFAULT 0,
  PRIMARY KEY (fid, ts_hour)
);

CREATE INDEX idx_user_metrics_ts ON user_metrics_hourly (ts_hour DESC);

-- =============================================================
-- 5. rankings_hourly: Computed rankings per metric
-- =============================================================
CREATE TABLE IF NOT EXISTS rankings_hourly (
  ts_hour TIMESTAMPTZ NOT NULL,
  metric_key TEXT NOT NULL,
  fid BIGINT NOT NULL,
  rank INT NOT NULL,
  score DOUBLE PRECISION NOT NULL DEFAULT 0,
  PRIMARY KEY (ts_hour, metric_key, fid)
);

CREATE INDEX idx_rankings_metric_ts ON rankings_hourly (metric_key, ts_hour DESC, rank ASC);

-- =============================================================
-- 6. notification_subscriptions: User notification preferences
-- =============================================================
CREATE TABLE IF NOT EXISTS notification_subscriptions (
  fid BIGINT PRIMARY KEY,
  enabled BOOLEAN DEFAULT TRUE,
  channel TEXT DEFAULT 'in_app' CHECK (channel IN ('in_app')),
  threshold_followers INT DEFAULT 20,
  locale TEXT DEFAULT 'ja' CHECK (locale IN ('ja', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 7. job_runs: Cron job execution log
-- =============================================================
CREATE TABLE IF NOT EXISTS job_runs (
  id BIGSERIAL PRIMARY KEY,
  job_name TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'success', 'error')),
  error_text TEXT,
  metadata JSONB
);

CREATE INDEX idx_job_runs_name_started ON job_runs (job_name, started_at DESC);

-- =============================================================
-- Retention: Function to delete data older than 7 days
-- =============================================================
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
DECLARE
  cutoff TIMESTAMPTZ := NOW() - INTERVAL '7 days';
BEGIN
  DELETE FROM follow_events WHERE detected_at < cutoff;
  DELETE FROM user_metrics_hourly WHERE ts_hour < cutoff;
  DELETE FROM rankings_hourly WHERE ts_hour < cutoff;
  DELETE FROM job_runs WHERE started_at < cutoff;
END;
$$ LANGUAGE plpgsql;
