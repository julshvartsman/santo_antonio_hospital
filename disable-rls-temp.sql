-- Temporarily disable RLS for testing
-- Run this in your Supabase SQL Editor

-- Disable RLS on entries table
ALTER TABLE entries DISABLE ROW LEVEL SECURITY;

-- Disable RLS on forms table  
ALTER TABLE forms DISABLE ROW LEVEL SECURITY;

-- Note: Remember to re-enable RLS after testing by running:
-- ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE forms ENABLE ROW LEVEL SECURITY; 