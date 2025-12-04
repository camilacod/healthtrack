-- Add supplement_category enum and column

-- 1) Create the enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supplement_category') THEN
    CREATE TYPE supplement_category AS ENUM (
      'Multivitamins',
      'Single Vitamins',
      'Minerals',
      'Functional Supplements',
      'Antioxidants',
      'Others'
    );
  END IF;
END $$;

-- 2) Add the new column (only if it doesn't exist)
ALTER TABLE public.supplements
  ADD COLUMN IF NOT EXISTS category supplement_category;

-- 3) Create index for category filtering (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_supplements_category ON supplements(category);

