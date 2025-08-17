import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { HospitalVariable } from "@/lib/supabaseClient";

export function useHospitalVariables(hospitalId?: string) {
  const [variables, setVariables] = useState<HospitalVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hospitalId) {
      fetchVariables(hospitalId);
    } else {
      setLoading(false);
    }
  }, [hospitalId]);

  const fetchVariables = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("hospital_variables")
        .select("*")
        .eq("hospital_id", id)
        .order("variable_name");

      if (error) throw error;
      setVariables(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch variables"
      );
      console.error("Error fetching hospital variables:", err);
    } finally {
      setLoading(false);
    }
  };

  const addVariable = async (
    variable: Omit<HospitalVariable, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { data, error } = await supabase
        .from("hospital_variables")
        .insert([variable])
        .select()
        .single();

      if (error) throw error;

      setVariables((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add variable");
      throw err;
    }
  };

  const updateVariable = async (
    id: string,
    updates: Partial<HospitalVariable>
  ) => {
    try {
      const { data, error } = await supabase
        .from("hospital_variables")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setVariables((prev) => prev.map((v) => (v.id === id ? data : v)));
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update variable"
      );
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

      setVariables((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete variable"
      );
      throw err;
    }
  };

  const getVariableValue = (variableName: string) => {
    const variable = variables.find((v) => v.variable_name === variableName);
    return variable?.variable_value;
  };

  return {
    variables,
    loading,
    error,
    addVariable,
    updateVariable,
    deleteVariable,
    getVariableValue,
    refresh: () => (hospitalId ? fetchVariables(hospitalId) : null),
  };
}
