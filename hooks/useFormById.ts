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
    // For admin users, we don't need to check hospital_id since they can access any hospital's forms
    // For department users, we still check their hospital_id
    if (user?.role !== 'admin' && user?.role !== 'super_admin' && !user?.hospital_id) {
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
        .maybeSingle();

      if (formError && formError.code !== "PGRST116") {
        throw formError;
      }

      // Get the corresponding entry data
      const monthYear = `${year}-${month.toString().padStart(2, "0")}-01`;
      const { data: entryData, error: entryError } = await supabase
        .from("entries")
        .select("*")
        .eq("hospital_id", hospitalId)
        .eq("month_year", monthYear)
        .maybeSingle();

      if (entryError && entryError.code !== "PGRST116") {
        throw entryError;
      }

      // Create or update the form directory entry
      if (!formData) {
        const { error: createFormError } = await supabase.from("forms").insert([
          {
            id: formId,
            hospital_id: hospitalId,
            month,
            year,
            submitted: false,
          },
        ]);

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
        data: entryData
          ? {
              kwh_usage: entryData.kwh_usage || 0,
              water_usage_m3: entryData.water_usage_m3 || 0,
              type1: entryData.type1 || 0,
              type2: entryData.type2 || 0,
              type3: entryData.type3 || 0,
              type4: entryData.type4 || 0,
              co2_emissions: entryData.co2_emissions || 0,
              km_travelled_gas: entryData.km_travelled_gas || 0,
              km_travelled_diesel: entryData.km_travelled_diesel || 0,
              km_travelled_gasoline: entryData.km_travelled_gasoline || 0,
              license_plate: entryData.license_plate || "",
              renewable_energy_created: entryData.renewable_energy_created || 0,
            }
          : {},
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

  // Helper function to ensure proper data type conversion
  const convertFormData = (data: Record<string, any>) => {
    return {
      kwh_usage: Number(data.kwh_usage) || 0,
      water_usage_m3: Number(data.water_usage_m3) || 0,
      type1: Number(data.type1) || 0,
      type2: Number(data.type2) || 0,
      type3: Number(data.type3) || 0,
      type4: Number(data.type4) || 0,
      co2_emissions: Number(data.co2_emissions) || 0,
      km_travelled_gas: Number(data.km_travelled_gas) || 0,
      km_travelled_diesel: Number(data.km_travelled_diesel) || 0,
      km_travelled_gasoline: Number(data.km_travelled_gasoline) || 0,
      license_plate:
        typeof data.license_plate === "string" ? data.license_plate : "",
      renewable_energy_created: Number(data.renewable_energy_created) || 0,
    };
  };

  const saveForm = async (data: Record<string, any>) => {
    if (!form || !user) return;

    try {
      setSaving(true);
      setError(null);

      // Get current user ID from Supabase auth
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !authUser) {
        throw new Error("Authentication error");
      }

      const monthYear = `${form.year}-${form.month
        .toString()
        .padStart(2, "0")}-01`;

      // Convert and validate form data
      const convertedData = convertFormData(data);

      // Check if entry already exists for this hospital and month/year
      const { data: existingEntry, error: checkError } = await supabase
        .from("entries")
        .select("id, user_id")
        .eq("hospital_id", form.hospital_id)
        .eq("month_year", monthYear)
        .maybeSingle();

      const entryData = {
        hospital_id: form.hospital_id,
        user_id: authUser.id,
        month_year: monthYear,
        ...convertedData,
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
        console.error("Error saving to entries table:", entryResult.error);
        console.error("Entry data that was sent:", entryData);
        throw entryResult.error;
      }

      console.log("Successfully saved to entries table:", entryResult.data);

      setForm((prev) =>
        prev
          ? {
              ...prev,
              data: convertedData,
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const submitForm = async (data: Record<string, any>) => {
    if (!form || !user) return;

    try {
      setSaving(true);
      setError(null);

      // Get current user ID from Supabase auth
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !authUser) {
        throw new Error("Authentication error");
      }

      const monthYear = `${form.year}-${form.month
        .toString()
        .padStart(2, "0")}-01`;

      // Convert and validate form data
      const convertedData = convertFormData(data);

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
        console.error("Error updating forms table:", updateFormError);
        throw updateFormError;
      }

      console.log("Successfully updated forms table");

      // Update entries table with all the data
      const entryData = {
        hospital_id: form.hospital_id,
        user_id: authUser.id,
        month_year: monthYear,
        ...convertedData,
        submitted: true,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check if entry already exists for this hospital and month/year
      const { data: existingEntry, error: checkError } = await supabase
        .from("entries")
        .select("id, user_id")
        .eq("hospital_id", form.hospital_id)
        .eq("month_year", monthYear)
        .maybeSingle();

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
        throw new Error(
          `Failed to sync to entries table: ${entryResult.error.message}`
        );
      } else {
        console.log("Successfully synced to entries table:", entryResult.data);
      }

      setForm((prev) =>
        prev
          ? {
              ...prev,
              data: convertedData,
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
