-- Fix Entries Table Unique Constraint
-- This script removes the problematic user_id constraint and creates a more appropriate one

-- Drop the existing unique constraint that's causing issues
ALTER TABLE entries DROP CONSTRAINT IF EXISTS entries_user_id_month_year_key;

-- Create a new unique constraint on hospital_id and month_year instead
-- This ensures each hospital can only have one entry per month, regardless of which user created it
ALTER TABLE entries ADD CONSTRAINT entries_hospital_id_month_year_key 
UNIQUE (hospital_id, month_year);

-- Also add an index for better performance
CREATE INDEX IF NOT EXISTS idx_entries_hospital_month_year 
ON entries (hospital_id, month_year);
