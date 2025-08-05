import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Hospital {
  id: string;
  name: string;
  location: string;
}

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHospitals() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("hospitals")
          .select("id, name, location")
          .order("name");

        if (error) {
          throw new Error(error.message);
        }

        setHospitals(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch hospitals");
        console.error("Error fetching hospitals:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHospitals();
  }, []);

  return { hospitals, loading, error };
} 