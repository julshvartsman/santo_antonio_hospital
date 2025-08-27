import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "./useAuth";

export interface UserHospital {
  id: string;
  name: string;
  location: string;
}

export function useUserHospital() {
  const { user } = useAuth();
  const [hospital, setHospital] = useState<UserHospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserHospital() {
      if (!user?.hospital_id) {
        setHospital(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("hospitals")
          .select("id, name, location")
          .eq("id", user.hospital_id)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setHospital(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch hospital");
        console.error("Error fetching user hospital:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserHospital();
  }, [user?.hospital_id]);

  return { hospital, loading, error };
}
