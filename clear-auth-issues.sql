-- Clear all corrupted authentication sessions and fix the system
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what's in the auth.users table
SELECT id, email, created_at, last_sign_in_at, raw_user_meta_data 
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Check profiles table
SELECT id, email, full_name, role, hospital_id, created_at 
FROM public.profiles 
ORDER BY created_at DESC;

-- 3. Clear any refresh tokens that might be corrupted
-- (This will force all users to log in again, but will fix the corruption)
DELETE FROM auth.refresh_tokens;

-- 4. Fix any orphaned profiles (profiles without matching auth.users)
DELETE FROM public.profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- 5. Ensure all auth.users have corresponding profiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'role', 'department_head')
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 6. Update any profiles that might have incorrect data
UPDATE public.profiles 
SET 
  email = au.email,
  full_name = COALESCE(
    profiles.full_name, 
    au.raw_user_meta_data->>'full_name', 
    au.raw_user_meta_data->>'name', 
    split_part(au.email, '@', 1)
  ),
  role = COALESCE(profiles.role, au.raw_user_meta_data->>'role', 'department_head')
FROM auth.users au
WHERE profiles.id = au.id;