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

      // Fetch forms and department heads separately
      const [formsResponse, profilesResponse] = await Promise.all([
        supabase
          .from("forms")
          .select(`
            *,
            hospitals!hospital_id (
              name
            )
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, email, full_name, hospital_id")
          .eq("role", "department_head")
      ]);

      if (formsResponse.error) {
        throw formsResponse.error;
      }
      if (profilesResponse.error) {
        throw profilesResponse.error;
      }

      const formsData = formsResponse.data;
      const profilesData = profilesResponse.data;

      // Transform the data to match our interface
      const transformedForms: FormData[] = (formsData || []).map((form: any) => {
        // Find the department head for this hospital
        const departmentHead = profilesData.find(
          (profile) => profile.hospital_id === form.hospital_id
        );

        return {
          id: form.id,
          hospital_id: form.hospital_id,
          hospital_name: form.hospitals?.name || "Unknown Hospital",
          month: form.month,
          year: form.year,
          submitted: form.submitted,
          submitted_at: form.submitted_at,
          created_at: form.created_at,
          updated_at: form.updated_at,
          department_head: departmentHead ? {
            name: departmentHead.full_name,
            email: departmentHead.email,
          } : undefined,
        };
      });

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