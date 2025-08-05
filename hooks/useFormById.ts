import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Form } from "@/types/forms";
import { useAuth } from "./useAuth";

export const useFormById = (formId: string) => {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const parseFormId = (id: string) => {
    // The format is: {hospitalId}-{MM}-{YYYY}
    // We need to handle cases where hospitalId might contain hyphens
    // So we split by the last two hyphens to get month and year
    const lastHyphenIndex = id.lastIndexOf("-");
    const secondLastHyphenIndex = id.lastIndexOf("-", lastHyphenIndex - 1);

    if (lastHyphenIndex === -1 || secondLastHyphenIndex === -1) {
      throw new Error("Invalid form ID format");
    }

    const hospitalId = id.substring(0, secondLastHyphenIndex);
    const monthStr = id.substring(secondLastHyphenIndex + 1, lastHyphenIndex);
    const yearStr = id.substring(lastHyphenIndex + 1);

    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    // Validate month and year
    if (isNaN(month) || month < 1 || month > 12) {
      throw new Error("Invalid month in form ID");
    }

    if (isNaN(year) || year < 2020 || year > 2030) {
      throw new Error("Invalid year in form ID");
    }

    return { hospitalId, month, year };
  };

  const fetchForm = async () => {
    if (!user?.hospital_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { hospitalId, month, year } = parseFormId(formId);

      // Check if this form exists in the forms directory
      const { data: formData, error: formError } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (formError && formError.code !== "PGRST116") {
        throw formError;
      }

      // Get the corresponding entry data
      const monthYear = `${year}-${month.toString().padStart(2, '0')}-01`;
      const { data: entryData, error: entryError } = await supabase
        .from("entries")
        .select("*")
        .eq("hospital_id", hospitalId)
        .eq("month_year", monthYear)
        .single();

      if (entryError && entryError.code !== "PGRST116") {
        throw entryError;
      }

      // Create or update the form directory entry
      if (!formData) {
        const { error: createFormError } = await supabase
          .from("forms")
          .insert([{
            id: formId,
            hospital_id: hospitalId,
            month,
            year,
            submitted: false,
          }]);

        if (createFormError) {
          throw createFormError;
        }
      }

      // Create the form object with data from entries table
      const form: Form = {
        id: formId,
        hospital_id: hospitalId,
        month,
        year,
        data: entryData ? {
          energy_usage: entryData.kwh_usage,
          water_usage: entryData.water_usage_m3,
          co2_emissions: entryData.co2_emissions,
          waste_generated: entryData.waste_generated,
          recycling_rate: entryData.recycling_rate,
          renewable_energy: entryData.renewable_energy_usage,
          paper_usage: entryData.paper_usage,
          chemical_usage: entryData.chemical_usage,
        } : {},
        submitted: formData?.submitted || entryData?.submitted || false,
        submitted_at: formData?.submitted_at || entryData?.submitted_at,
        created_at: formData?.created_at,
        updated_at: formData?.updated_at,
      };

      setForm(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch form");
    } finally {
      setLoading(false);
    }
  };

  const saveForm = async (data: Record<string, number>) => {
    if (!form || !user) return;

    try {
      setSaving(true);
      setError(null);

      // Get current user ID from Supabase auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        throw new Error("Authentication error");
      }

      const monthYear = `${form.year}-${form.month.toString().padStart(2, '0')}-01`;

      // Check if entry already exists
      const { data: existingEntry, error: checkError } = await supabase
        .from("entries")
        .select("id")
        .eq("hospital_id", form.hospital_id)
        .eq("month_year", monthYear)
        .single();

      const entryData = {
        hospital_id: form.hospital_id,
        user_id: authUser.id,
        month_year: monthYear,
        kwh_usage: data.energy_usage || 0,
        water_usage_m3: data.water_usage || 0,
        co2_emissions: data.co2_emissions || 0,
        waste_generated: data.waste_generated || 0,
        recycling_rate: data.recycling_rate || 0,
        renewable_energy_usage: data.renewable_energy || 0,
        paper_usage: data.paper_usage || 0,
        chemical_usage: data.chemical_usage || 0,
        submitted: false,
        updated_at: new Date().toISOString(),
      };

      let entryResult;

      if (existingEntry) {
        // Update existing entry
        entryResult = await supabase
          .from("entries")
          .update(entryData)
          .eq("id", existingEntry.id)
          .select()
          .single();
      } else {
        // Create new entry
        entryResult = await supabase
          .from("entries")
          .insert([entryData])
          .select()
          .single();
      }

      if (entryResult.error) {
        throw entryResult.error;
      }

      setForm((prev) =>
        prev
          ? {
              ...prev,
              data,
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const submitForm = async (data: Record<string, number>) => {
    if (!form || !user) return;

    try {
      setSaving(true);
      setError(null);

      // Get current user ID from Supabase auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        throw new Error("Authentication error");
      }

      const monthYear = `${form.year}-${form.month.toString().padStart(2, '0')}-01`;

      // Update forms table with submission status
      const { error: updateFormError } = await supabase
        .from("forms")
        .update({
          submitted: true,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", formId);

      if (updateFormError) {
        throw updateFormError;
      }

      // Update entries table with all the data
      const entryData = {
        hospital_id: form.hospital_id,
        user_id: authUser.id,
        month_year: monthYear,
        kwh_usage: data.energy_usage || 0,
        water_usage_m3: data.water_usage || 0,
        co2_emissions: data.co2_emissions || 0,
        waste_generated: data.waste_generated || 0,
        recycling_rate: data.recycling_rate || 0,
        renewable_energy_usage: data.renewable_energy || 0,
        paper_usage: data.paper_usage || 0,
        chemical_usage: data.chemical_usage || 0,
        submitted: true,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check if entry already exists
      const { data: existingEntry, error: checkError } = await supabase
        .from("entries")
        .select("id")
        .eq("hospital_id", form.hospital_id)
        .eq("month_year", monthYear)
        .single();

      let entryResult;

      if (existingEntry) {
        // Update existing entry
        entryResult = await supabase
          .from("entries")
          .update(entryData)
          .eq("id", existingEntry.id)
          .select()
          .single();
      } else {
        // Create new entry
        entryResult = await supabase
          .from("entries")
          .insert([entryData])
          .select()
          .single();
      }

      if (entryResult.error) {
        console.error("Error syncing to entries table:", entryResult.error);
        console.error("Entry result:", entryResult);
        console.error("Entry data that was sent:", entryData);
        console.error("Existing entry found:", existingEntry);
        // Don't throw error here - forms table was updated successfully
      } else {
        console.log("Successfully synced to entries table:", entryResult.data);
      }

      setForm((prev) =>
        prev
          ? {
              ...prev,
              data,
              submitted: true,
              submitted_at: new Date().toISOString(),
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchForm();
  }, [formId, user?.hospital_id]);

  return {
    form,
    loading,
    error,
    saving,
    saveForm,
    submitForm,
    refresh: fetchForm,
  };
};
