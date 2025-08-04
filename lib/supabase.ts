import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gjckquuhfzfvgtwyybut.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseKey)

// For server-side operations that require elevated permissions
export const createServiceClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Database Types (you'll expand these based on your actual schema)
export interface SustainabilityMetric {
  id: string;
  category: string;
  metric: string;
  value: number;
  unit: string;
  target: number;
  status: "on-track" | "at-risk" | "behind";
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}
