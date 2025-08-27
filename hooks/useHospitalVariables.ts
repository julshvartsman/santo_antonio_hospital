import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface HospitalVariable {
  id: string;
  hospital_id: string;
  variable_name: string;
  variable_value: any;
  variable_type: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function useHospitalVariables(hospitalId: string) {
  const [variables, setVariables] = useState<HospitalVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHospitalVariables() {
      if (!hospitalId) {
        setVariables([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("hospital_variables")
          .select("*")
          .eq("hospital_id", hospitalId)
          .order("variable_name");

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        setVariables(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch hospital variables");
        console.error("Error fetching hospital variables:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHospitalVariables();
  }, [hospitalId]);

  const addVariable = async (variable: Omit<HospitalVariable, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from("hospital_variables")
        .insert([variable])
        .select()
        .single();

      if (error) throw error;

      setVariables(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error("Error adding hospital variable:", err);
      throw err;
    }
  };

  const updateVariable = async (id: string, updates: Partial<HospitalVariable>) => {
    try {
      const { data, error } = await supabase
        .from("hospital_variables")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setVariables(prev => prev.map(v => v.id === id ? data : v));
      return data;
    } catch (err) {
      console.error("Error updating hospital variable:", err);
      throw err;
    }
  };

  const deleteVariable = async (id: string) => {
    try {
      const { error } = await supabase
        .from("hospital_variables")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setVariables(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error("Error deleting hospital variable:", err);
      throw err;
    }
  };

  const getVariableValue = (variableName: string) => {
    const variable = variables.find(v => v.variable_name === variableName);
    return variable ? variable.variable_value : null;
  };

  return {
    variables,
    loading,
    error,
    addVariable,
    updateVariable,
    deleteVariable,
    getVariableValue,
  };
}
