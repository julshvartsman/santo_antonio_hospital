-- Hospital Variables Table
CREATE TABLE IF NOT EXISTS hospital_variables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  variable_name TEXT NOT NULL,
  variable_value JSONB NOT NULL,
  variable_type TEXT NOT NULL DEFAULT 'number',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hospital_id, variable_name)
);

-- Enable RLS on hospital_variables table
ALTER TABLE hospital_variables ENABLE ROW LEVEL SECURITY;

-- Admins can manage all hospital variables
CREATE POLICY "Admins can manage all hospital variables" ON hospital_variables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Department heads can view their hospital's variables
CREATE POLICY "Department heads can view their hospital variables" ON hospital_variables
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.hospital_id = hospital_variables.hospital_id
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hospital_variables_updated_at 
    BEFORE UPDATE ON hospital_variables 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some example variables for testing
INSERT INTO hospital_variables (hospital_id, variable_name, variable_value, variable_type, description) VALUES
  ((SELECT id FROM hospitals WHERE name = 'Central Hospital' LIMIT 1), 'energy_target_kwh', '50000', 'number', 'Monthly energy consumption target in kWh'),
  ((SELECT id FROM hospitals WHERE name = 'Central Hospital' LIMIT 1), 'water_target_m3', '1000', 'number', 'Monthly water consumption target in cubic meters'),
  ((SELECT id FROM hospitals WHERE name = 'Central Hospital' LIMIT 1), 'enable_renewable_tracking', 'true', 'boolean', 'Enable renewable energy tracking for this hospital'),
  ((SELECT id FROM hospitals WHERE name = 'Regional Hospital A' LIMIT 1), 'energy_target_kwh', '75000', 'number', 'Monthly energy consumption target in kWh'),
  ((SELECT id FROM hospitals WHERE name = 'Regional Hospital A' LIMIT 1), 'custom_metrics', '["co2_emissions", "waste_recycling"]', 'json', 'Custom metrics to track for this hospital');
