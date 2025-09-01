# Database Migration Instructions

## Adding Fuel Liters Columns

To add the new fuel efficiency tracking columns to your Supabase database:

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL commands from `add-fuel-liters-columns.sql`

### Option 2: Using Supabase CLI
```bash
supabase db reset  # if you want to reset completely
# or apply the migration directly in the SQL editor
```

### Option 3: Direct SQL Execution
Copy and paste this SQL into your Supabase SQL editor:

```sql
-- Add columns for tracking fuel consumption in liters
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
```

After running this migration, the entries table will have the new columns:
- `liters_consumed_gas`
- `liters_consumed_diesel` 
- `liters_consumed_gasoline`

This will enable fuel efficiency calculations (km/liters) in the admin dashboard.
