-- Fix Hospital RLS Policies for Public Access
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all hospitals" ON hospitals;
DROP POLICY IF EXISTS "Department heads can view their hospital" ON hospitals;

-- Create a new policy that allows public read access to hospitals
-- This is needed for the signup page where users aren't authenticated yet
CREATE POLICY "Public can view all hospitals" ON hospitals
  FOR SELECT USING (true);

-- Keep the existing policies for other operations (insert, update, delete)
-- These will still require proper authentication

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'hospitals'; 