-- Add columns for tracking fuel consumption in liters
-- This allows for fuel efficiency calculations (km/liters)

-- Add liters consumed columns for each fuel type
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS liters_consumed_gas DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS liters_consumed_diesel DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS liters_consumed_gasoline DECIMAL(10,2) DEFAULT 0;

-- Update existing entries to have 0 values for the new columns
UPDATE entries 
SET 
  liters_consumed_gas = COALESCE(liters_consumed_gas, 0),
  liters_consumed_diesel = COALESCE(liters_consumed_diesel, 0),
  liters_consumed_gasoline = COALESCE(liters_consumed_gasoline, 0)
WHERE 
  liters_consumed_gas IS NULL 
  OR liters_consumed_diesel IS NULL 
  OR liters_consumed_gasoline IS NULL;

-- Add constraints to ensure non-negative values
ALTER TABLE entries 
ADD CONSTRAINT check_liters_consumed_gas_non_negative 
CHECK (liters_consumed_gas >= 0);

ALTER TABLE entries 
ADD CONSTRAINT check_liters_consumed_diesel_non_negative 
CHECK (liters_consumed_diesel >= 0);

ALTER TABLE entries 
ADD CONSTRAINT check_liters_consumed_gasoline_non_negative 
CHECK (liters_consumed_gasoline >= 0);
