import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface FormData {
  id: string;
  hospital_id: string;
  hospital_name: string;
  month: number;
  year: number;
  submitted: boolean;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  department_head?: {
    name: string;
    email: string;
  };
}

export function useForms() {
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch forms with hospital and department head information
      const { data, error: fetchError } = await supabase
        .from("forms")
        .select(`
          *,
          hospitals!hospital_id (
            name,
            profiles!hospital_id (
              full_name,
              email
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform the data to match our interface
      const transformedForms: FormData[] = (data || []).map((form: any) => ({
        id: form.id,
        hospital_id: form.hospital_id,
        hospital_name: form.hospitals?.name || "Unknown Hospital",
        month: form.month,
        year: form.year,
        submitted: form.submitted,
        submitted_at: form.submitted_at,
        created_at: form.created_at,
        updated_at: form.updated_at,
        department_head: form.hospitals?.profiles?.[0] ? {
          name: form.hospitals.profiles[0].full_name,
          email: form.hospitals.profiles[0].email,
        } : undefined,
      }));

      setForms(transformedForms);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching forms:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const refresh = () => {
    fetchForms();
  };

  return {
    forms,
    loading,
    error,
    refresh,
  };
} 