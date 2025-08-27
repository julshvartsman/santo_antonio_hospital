-- Fix Admin Permissions for Forms and Entries Tables
-- This script updates RLS policies to allow admin users to create and manage forms and entries

-- Drop existing admin policies for forms table
DROP POLICY IF EXISTS "Admins can view all forms" ON forms;

-- Create new admin policy for forms table that allows all operations
CREATE POLICY "Admins can manage all forms" ON forms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    )
  );

-- Drop existing admin policies for entries table
DROP POLICY IF EXISTS "Admins can view all entries" ON entries;

-- Create new admin policy for entries table that allows all operations
CREATE POLICY "Admins can manage all entries" ON entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    )
  );

-- Also update hospital_variables policy to include super_admin
DROP POLICY IF EXISTS "Admins can manage all hospital variables" ON hospital_variables;

CREATE POLICY "Admins can manage all hospital variables" ON hospital_variables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    )
  );
