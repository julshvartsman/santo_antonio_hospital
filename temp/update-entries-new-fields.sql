-- Add new columns to entries for vehicle and renewable energy data
-- Safe to run multiple times due to IF NOT EXISTS guards

-- Replace old fuel fields with per-fuel distance fields
alter table entries add column if not exists km_travelled_gas numeric(12,2) default 0;
alter table entries add column if not exists km_travelled_diesel numeric(12,2) default 0;
alter table entries add column if not exists km_travelled_gasoline numeric(12,2) default 0;
alter table entries add column if not exists license_plate text;
alter table entries add column if not exists renewable_energy_created numeric(12,2) default 0;

-- Optional: indexes for reporting
-- No index needed for numeric km fields here; add as required for reporting

