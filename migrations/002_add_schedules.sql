-- Add schedule tables for supplement reminders
-- Run this migration to add scheduling functionality

-- Schedule container (one per user-supplement)
CREATE TABLE IF NOT EXISTS supplement_schedules (
  id SERIAL PRIMARY KEY,
  user_supplement_id INT8 NOT NULL REFERENCES user_supplements(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_supplement_id) -- One schedule per user-supplement
);

-- Days of the week for each schedule
CREATE TABLE IF NOT EXISTS schedule_days (
  id SERIAL PRIMARY KEY,
  schedule_id INT NOT NULL REFERENCES supplement_schedules(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  UNIQUE(schedule_id, day_of_week)
);

-- Times of day for each schedule
CREATE TABLE IF NOT EXISTS schedule_times (
  id SERIAL PRIMARY KEY,
  schedule_id INT NOT NULL REFERENCES supplement_schedules(id) ON DELETE CASCADE,
  time_of_day TIME NOT NULL,
  label TEXT, -- Optional: "Morning", "With dinner", etc.
  UNIQUE(schedule_id, time_of_day)
);

-- Log of supplement intake (for tracking)
CREATE TABLE IF NOT EXISTS supplement_logs (
  id SERIAL PRIMARY KEY,
  user_supplement_id INT8 NOT NULL REFERENCES user_supplements(id) ON DELETE CASCADE,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_time TIME, -- Reference to scheduled time (nullable for ad-hoc)
  skipped BOOLEAN DEFAULT false,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_supplement_schedules_user_supplement ON supplement_schedules(user_supplement_id);
CREATE INDEX IF NOT EXISTS idx_schedule_days_schedule ON schedule_days(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_times_schedule ON schedule_times(schedule_id);
CREATE INDEX IF NOT EXISTS idx_supplement_logs_user_supplement ON supplement_logs(user_supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_logs_taken_at ON supplement_logs(taken_at);

-- User stats for tracking streaks
CREATE TABLE IF NOT EXISTS user_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Daily summaries for historical analytics
CREATE TABLE IF NOT EXISTS daily_summaries (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  doses_taken INT DEFAULT 0,
  doses_scheduled INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Indexes for stats tables
CREATE INDEX IF NOT EXISTS idx_user_stats_user ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date);

