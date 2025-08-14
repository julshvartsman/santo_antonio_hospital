-- Add new columns to entries for vehicle and renewable energy data
-- Safe to run multiple times due to IF NOT EXISTS guards

alter table entries add column if not exists fuel_type text; -- 'gas' | 'diesel'
alter table entries add column if not exists kilometers_travelled numeric(12,2) default 0;
alter table entries add column if not exists license_plate text;
alter table entries add column if not exists renewable_energy_created numeric(12,2) default 0;

-- Optional: indexes for reporting
create index if not exists idx_entries_fuel_type on entries (fuel_type);

