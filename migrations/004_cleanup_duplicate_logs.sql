-- Clean up duplicate supplement_logs entries
-- Keeps only the most recent log for each (user_supplement_id, scheduled_time, date) combination

DELETE FROM supplement_logs a
USING supplement_logs b
WHERE a.id < b.id 
  AND a.user_supplement_id = b.user_supplement_id
  AND a.scheduled_time = b.scheduled_time
  AND a.taken_at::date = b.taken_at::date;

-- Add a unique constraint to prevent future duplicates (optional but recommended)
-- Uncomment if you want to enforce this at the database level
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_supplement_logs_unique_dose 
--   ON supplement_logs(user_supplement_id, scheduled_time, (taken_at::date))
--   WHERE skipped = false;

