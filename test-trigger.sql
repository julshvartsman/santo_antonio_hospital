-- Test script to check if the user creation trigger is working
-- Run this in Supabase SQL Editor

-- First, let's check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if the function exists
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Test the trigger manually by inserting a test user
-- (This will only work if you have the right permissions)
-- INSERT INTO auth.users (
--   id,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at,
--   raw_user_meta_data
-- ) VALUES (
--   gen_random_uuid(),
--   'test@example.com',
--   crypt('password', gen_salt('bf')),
--   now(),
--   now(),
--   now(),
--   '{"full_name": "Test User", "role": "department_head"}'::jsonb
-- );

-- Check if profiles table has the right structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check RLS policies on profiles table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'; 