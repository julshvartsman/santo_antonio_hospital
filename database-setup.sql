-- Hospital Sustainability Dashboard Database Setup
-- Run this in your Supabase SQL Editor

-- Create tables

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Department heads table  
CREATE TABLE IF NOT EXISTS department_heads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entries table (sustainability metrics)
CREATE TABLE IF NOT EXISTS entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year DATE NOT NULL, -- Format: YYYY-MM-01
  kwh_usage DECIMAL(10,2) NOT NULL DEFAULT 0,
  water_usage_m3 DECIMAL(10,2) NOT NULL DEFAULT 0,
  co2_emissions DECIMAL(10,2) NOT NULL DEFAULT 0,
  submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hospital_id, month_year)
);

-- Forms table (new dynamic forms system)
CREATE TABLE IF NOT EXISTS forms (
  id TEXT PRIMARY KEY, -- Format: '${hospitalId}-${MM}-${YYYY}'
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  month INT NOT NULL,
  year INT NOT NULL,
  data JSONB DEFAULT '{}', -- map of metricKey → numeric value
  submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (extend auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'department_head')) DEFAULT 'department_head',
  hospital_id UUID REFERENCES hospitals(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('info', 'warning', 'error', 'success', 'reminder')) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Hospitals: Admins can see all, department heads can see their own
CREATE POLICY "Admins can view all hospitals" ON hospitals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Department heads can view their hospital" ON hospitals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.hospital_id = hospitals.id
    )
  );

-- Entries: Users can manage their own, admins can see all
CREATE POLICY "Users can manage their own entries" ON entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all entries" ON entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Forms: Users can manage their own hospital's forms, admins can see all
CREATE POLICY "Users can manage their hospital's forms" ON forms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.hospital_id = forms.hospital_id
    )
  );

CREATE POLICY "Admins can view all forms" ON forms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Department Heads: Admins can see all
CREATE POLICY "Admins can view all department heads" ON department_heads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Profiles: Users can see their own, admins can see all
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Notifications: Users can see their own
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entries_hospital_month ON entries(hospital_id, month_year);
CREATE INDEX IF NOT EXISTS idx_entries_user ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_hospital_month_year ON forms(hospital_id, month, year);
CREATE INDEX IF NOT EXISTS idx_profiles_hospital ON profiles(hospital_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON entries 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'department_head');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert 8 hospitals
INSERT INTO hospitals (id, name, location) VALUES
  (gen_random_uuid(), 'General Hospital North', 'North District'),
  (gen_random_uuid(), 'General Hospital South', 'South District'), 
  (gen_random_uuid(), 'General Hospital East', 'East District'),
  (gen_random_uuid(), 'General Hospital West', 'West District'),
  (gen_random_uuid(), 'Central Medical Center', 'Downtown'),
  (gen_random_uuid(), 'Regional Hospital A', 'Region A'),
  (gen_random_uuid(), 'Regional Hospital B', 'Region B'),
  (gen_random_uuid(), 'Metropolitan Hospital', 'Metro Area')
ON CONFLICT DO NOTHING;

-- Create sample admin user (you'll need to sign up with this email first)
-- Then run this to make them admin:
/*
UPDATE profiles 
SET role = 'admin', hospital_id = NULL 
WHERE email = 'admin@hospital.com';
*/

-- Sample data for the last 3 months for each hospital
-- (Run this after creating some test users and hospitals)
/*
INSERT INTO entries (hospital_id, user_id, month_year, kwh_usage, water_usage_m3, co2_emissions, submitted, submitted_at) 
SELECT 
  h.id as hospital_id,
  (SELECT id FROM profiles WHERE role = 'department_head' AND hospital_id = h.id LIMIT 1) as user_id,
  DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months') as month_year,
  ROUND((RANDOM() * 5000 + 8000)::numeric, 2) as kwh_usage,
  ROUND((RANDOM() * 500 + 600)::numeric, 2) as water_usage_m3,
  ROUND((RANDOM() * 1000 + 1500)::numeric, 2) as co2_emissions,
  true as submitted,
  CURRENT_TIMESTAMP - INTERVAL '2 months' as submitted_at
FROM hospitals h
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'department_head' AND hospital_id = h.id);

INSERT INTO entries (hospital_id, user_id, month_year, kwh_usage, water_usage_m3, co2_emissions, submitted, submitted_at) 
SELECT 
  h.id as hospital_id,
  (SELECT id FROM profiles WHERE role = 'department_head' AND hospital_id = h.id LIMIT 1) as user_id,
  DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') as month_year,
  ROUND((RANDOM() * 5000 + 8000)::numeric, 2) as kwh_usage,
  ROUND((RANDOM() * 500 + 600)::numeric, 2) as water_usage_m3,
  ROUND((RANDOM() * 1000 + 1500)::numeric, 2) as co2_emissions,
  true as submitted,
  CURRENT_TIMESTAMP - INTERVAL '1 month' as submitted_at
FROM hospitals h
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'department_head' AND hospital_id = h.id);

-- Current month entries (some submitted, some not)
INSERT INTO entries (hospital_id, user_id, month_year, kwh_usage, water_usage_m3, co2_emissions, submitted, submitted_at) 
SELECT 
  h.id as hospital_id,
  (SELECT id FROM profiles WHERE role = 'department_head' AND hospital_id = h.id LIMIT 1) as user_id,
  DATE_TRUNC('month', CURRENT_DATE) as month_year,
  ROUND((RANDOM() * 5000 + 8000)::numeric, 2) as kwh_usage,
  ROUND((RANDOM() * 500 + 600)::numeric, 2) as water_usage_m3,
  ROUND((RANDOM() * 1000 + 1500)::numeric, 2) as co2_emissions,
  CASE WHEN RANDOM() > 0.5 THEN true ELSE false END as submitted,
  CASE WHEN RANDOM() > 0.5 THEN CURRENT_TIMESTAMP ELSE NULL END as submitted_at
FROM hospitals h
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'department_head' AND hospital_id = h.id)
LIMIT 8;
*/