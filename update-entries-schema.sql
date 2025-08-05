-- Update entries table to include all sustainability metrics
-- Run this in your Supabase SQL Editor

-- Add new columns to entries table
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS waste_generated DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS recycling_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS renewable_energy_usage DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS paper_usage DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS chemical_usage DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Remove the data column from forms table since it's now just a directory
ALTER TABLE forms DROP COLUMN IF EXISTS data;

-- Update any existing entries to have default values for new columns
UPDATE entries 
SET 
  waste_generated = 0,
  recycling_rate = 0,
  renewable_energy_usage = 0,
  paper_usage = 0,
  chemical_usage = 0
WHERE waste_generated IS NULL 
   OR recycling_rate IS NULL 
   OR renewable_energy_usage IS NULL 
   OR paper_usage IS NULL 
   OR chemical_usage IS NULL; 