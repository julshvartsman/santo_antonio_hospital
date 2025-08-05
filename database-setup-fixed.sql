-- Hospital Sustainability Dashboard Database Setup (Fixed Version)
-- Run this in your Supabase SQL Editor
-- This version handles existing policies gracefully

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
  waste_generated DECIMAL(10,2) NOT NULL DEFAULT 0,
  recycling_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  renewable_energy_usage DECIMAL(10,2) NOT NULL DEFAULT 0,
  paper_usage DECIMAL(10,2) NOT NULL DEFAULT 0,
  chemical_usage DECIMAL(10,2) NOT NULL DEFAULT 0,
  submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hospital_id, month_year)
);

-- Forms table (directory of all possible forms)
CREATE TABLE IF NOT EXISTS forms (
  id TEXT PRIMARY KEY, -- Format: '${hospitalId}-${MM}-${YYYY}'
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  month INT NOT NULL,
  year INT NOT NULL,
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

-- Support messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_name VARCHAR(255) NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  from_phone VARCHAR(50),
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')) DEFAULT 'pending',
  admin_response TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all hospitals" ON hospitals;
DROP POLICY IF EXISTS "Department heads can view their hospital" ON hospitals;
DROP POLICY IF EXISTS "Users can manage their own entries" ON entries;
DROP POLICY IF EXISTS "Admins can view all entries" ON entries;
DROP POLICY IF EXISTS "Users can manage their hospital's forms" ON forms;
DROP POLICY IF EXISTS "Admins can view all forms" ON forms;
DROP POLICY IF EXISTS "Admins can view all department heads" ON department_heads;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view their own support messages" ON support_messages;
DROP POLICY IF EXISTS "Admins can view all support messages" ON support_messages;

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

-- Notifications: Users can see their own, admins can see all
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Support messages: Users can see their own, admins can see all
CREATE POLICY "Users can view their own support messages" ON support_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all support messages" ON support_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entries_hospital_month ON entries(hospital_id, month_year);
CREATE INDEX IF NOT EXISTS idx_entries_user ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_hospital_month_year ON forms(hospital_id, month, year);
CREATE INDEX IF NOT EXISTS idx_profiles_hospital ON profiles(hospital_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_user ON support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_status ON support_messages(status);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON entries 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_support_messages_updated_at BEFORE UPDATE ON support_messages 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'department_head');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert sample data (optional - uncomment if you want sample data)
-- INSERT INTO hospitals (name, location) VALUES 
--   ('Central Hospital', 'Lisbon'),
--   ('North Medical Center', 'Porto'),
--   ('South General', 'Faro'),
--   ('East Regional', 'Coimbra'),
--   ('West Community', 'Braga'),
--   ('Coastal Medical', 'Aveiro'),
--   ('Mountain View', 'Guarda'),
--   ('Riverside Health', 'Viseu')
-- ON CONFLICT DO NOTHING; 