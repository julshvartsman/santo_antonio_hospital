-- Remove old fuel fields that are no longer needed
-- WARNING: This will permanently delete data in these columns
-- Only run after confirming the new fields are working correctly

-- Drop the old columns
ALTER TABLE entries DROP COLUMN IF EXISTS fuel_type;
ALTER TABLE entries DROP COLUMN IF EXISTS kilometers_travelled;

-- Drop any indexes on the old columns
DROP INDEX IF EXISTS idx_entries_fuel_type;

-- Verify the new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'entries' 
AND column_name IN ('km_travelled_gas', 'km_travelled_diesel', 'km_travelled_gasoline');
