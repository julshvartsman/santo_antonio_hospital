import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    // Reduce auth timeout for faster response
    storageKey: "cityx-hospital-auth",
  },
  global: {
    headers: {
      "X-Client-Info": "cityx-hospital",
    },
    // Add fetch timeout
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },
  db: {
    schema: "public",
  },
  realtime: {
    params: {
      eventsPerSecond: 5, // Reduced from 10
    },
  },
});

// For server-side operations with elevated permissions
export const createServerSupabaseClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createBrowserClient(supabaseUrl, serviceRoleKey);
};

// Database Types
export interface Hospital {
  id: string;
  name: string;
  location: string;
  department_head_id: string;
  created_at: string;
}

export interface DepartmentHead {
  id: string;
  hospital_id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface Entry {
  id: string;
  hospital_id: string;
  user_id: string;
  month_year: string; // Format: YYYY-MM-01
  kwh_usage: number;
  water_usage_m3: number;
  type1: number;
  type2: number;
  type3: number;
  type4: number;
  co2_emissions: number;
  km_travelled_gas?: number;
  km_travelled_diesel?: number;
  km_travelled_gasoline?: number;
  license_plate?: string;
  renewable_energy_created?: number;
  submitted: boolean;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: "admin" | "department_head";
  hospital_id?: string;
  created_at: string;
}

/*
-- SQL Setup for Supabase Database --

-- Enable RLS on all tables
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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
      AND _id = hospitals.id
    )
  );

-- Entries: Owners can manage their own, admins can see all
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

-- Department Heads: Admins can see all
CREATE POLICY "Admins can view all department heads" ON department_heads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

*/
