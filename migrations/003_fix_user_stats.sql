-- Fix user_stats table to ensure unique constraint exists
-- Run this if you're getting ON CONFLICT errors

-- First, drop any duplicate rows keeping only the most recent
DELETE FROM user_stats a USING user_stats b
WHERE a.id < b.id AND a.user_id = b.user_id;

-- Add the unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_stats_user_id_key'
  ) THEN
    ALTER TABLE user_stats ADD CONSTRAINT user_stats_user_id_key UNIQUE (user_id);
  END IF;
END $$;

