-- Test Users Setup for Reminder System Testing
-- Run this in your Supabase SQL Editor after the main database setup

-- Insert sample hospitals
INSERT INTO hospitals (name, location) VALUES 
  ('Central Hospital', 'Lisbon'),
  ('North Medical Center', 'Porto'),
  ('South General', 'Faro'),
  ('East Regional', 'Coimbra'),
  ('West Community', 'Braga'),
  ('Coastal Medical', 'Aveiro'),
  ('Mountain View', 'Guarda'),
  ('Riverside Health', 'Viseu')
ON CONFLICT DO NOTHING;

-- Insert test admin user (you'll need to create this user in Supabase Auth first)
-- Replace 'your-admin-user-id' with the actual UUID from your Supabase Auth
INSERT INTO profiles (id, email, full_name, role) VALUES 
  ('your-admin-user-id', 'admin@hospital.com', 'Admin User', 'admin')
ON CONFLICT DO NOTHING;

-- Insert test department heads (replace with actual user IDs from Supabase Auth)
INSERT INTO profiles (id, email, full_name, role, hospital_id) VALUES 
  ('dept-head-1-id', 'head1@hospital.com', 'Dr. Maria Silva', 'department_head', (SELECT id FROM hospitals WHERE name = 'Central Hospital')),
  ('dept-head-2-id', 'head2@hospital.com', 'Dr. João Santos', 'department_head', (SELECT id FROM hospitals WHERE name = 'North Medical Center')),
  ('dept-head-3-id', 'head3@hospital.com', 'Dr. Ana Costa', 'department_head', (SELECT id FROM hospitals WHERE name = 'South General')),
  ('dept-head-4-id', 'head4@hospital.com', 'Dr. Pedro Oliveira', 'department_head', (SELECT id FROM hospitals WHERE name = 'East Regional'))
ON CONFLICT DO NOTHING;

-- Insert some sample entries to test submission status
INSERT INTO entries (hospital_id, user_id, month_year, kwh_usage, water_usage_m3, co2_emissions, submitted, submitted_at) VALUES 
  ((SELECT id FROM hospitals WHERE name = 'Central Hospital'), 'dept-head-1-id', '2024-01-01', 15000.50, 500.25, 7500.25, true, NOW()),
  ((SELECT id FROM hospitals WHERE name = 'North Medical Center'), 'dept-head-2-id', '2024-01-01', 12000.75, 450.50, 6000.38, false, NULL),
  ((SELECT id FROM hospitals WHERE name = 'South General'), 'dept-head-3-id', '2024-01-01', 18000.25, 600.75, 9000.13, true, NOW()),
  ((SELECT id FROM hospitals WHERE name = 'East Regional'), 'dept-head-4-id', '2024-01-01', 9000.50, 300.25, 4500.25, false, NULL)
ON CONFLICT DO NOTHING;

-- Insert sample support messages
INSERT INTO support_messages (from_name, from_email, message, user_id, status) VALUES 
  ('Dr. Maria Silva', 'head1@hospital.com', 'Need help with energy reporting', 'dept-head-1-id', 'pending'),
  ('Dr. João Santos', 'head2@hospital.com', 'Question about water consumption metrics', 'dept-head-2-id', 'resolved')
ON CONFLICT DO NOTHING; 