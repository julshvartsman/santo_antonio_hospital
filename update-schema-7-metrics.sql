-- Update entries table to support exactly 7 sustainability metrics
-- Run this in your Supabase SQL Editor

-- Remove unused columns from entries table
ALTER TABLE entries 
DROP COLUMN IF EXISTS waste_generated,
DROP COLUMN IF EXISTS recycling_rate,
DROP COLUMN IF EXISTS renewable_energy_usage,
DROP COLUMN IF EXISTS paper_usage,
DROP COLUMN IF EXISTS chemical_usage;

-- Add the 4 waste type columns
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS waste_type1 DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS waste_type2 DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS waste_type3 DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS waste_type4 DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Update any existing entries to have default values for new waste type columns
UPDATE entries 
SET 
  waste_type1 = 0,
  waste_type2 = 0,
  waste_type3 = 0,
  waste_type4 = 0
WHERE waste_type1 IS NULL 
   OR waste_type2 IS NULL 
   OR waste_type3 IS NULL 
   OR waste_type4 IS NULL;

-- Add comments to clarify the 7 metrics
COMMENT ON COLUMN entries.kwh_usage IS 'Electricity usage in kWh';
COMMENT ON COLUMN entries.water_usage_m3 IS 'Water usage in cubic meters';
COMMENT ON COLUMN entries.waste_type1 IS 'Type 1 waste residuals in kg';
COMMENT ON COLUMN entries.waste_type2 IS 'Type 2 waste residuals in kg';
COMMENT ON COLUMN entries.waste_type3 IS 'Type 3 waste residuals in kg';
COMMENT ON COLUMN entries.waste_type4 IS 'Type 4 waste residuals in kg';
COMMENT ON COLUMN entries.co2_emissions IS 'CO2 emissions in kg CO2e (calculated from other metrics)';