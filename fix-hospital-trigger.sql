-- Fix the hospital assignment trigger function
-- Run this in your Supabase SQL Editor

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create an improved function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  hospital_id UUID;
  hospital_name TEXT;
BEGIN
  -- Get hospital name from user metadata
  hospital_name := NEW.raw_user_meta_data->>'hospital';
  
  -- Try to find hospital by name
  IF hospital_name IS NOT NULL THEN
    SELECT id INTO hospital_id 
    FROM hospitals 
    WHERE name = hospital_name 
    LIMIT 1;
    
    -- Log for debugging
    RAISE LOG 'New user signup: email=%, hospital_name=%, hospital_id=%', 
      NEW.email, hospital_name, hospital_id;
  END IF;

  -- Insert profile with hospital_id
  INSERT INTO public.profiles (id, email, full_name, role, hospital_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'department_head'),
    hospital_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Verify hospitals exist
SELECT 'Hospitals in database:' as info;
SELECT id, name FROM hospitals ORDER BY name;

-- Check existing profiles
SELECT 'Existing profiles:' as info;
SELECT id, email, full_name, role, hospital_id FROM profiles ORDER BY created_at DESC; 