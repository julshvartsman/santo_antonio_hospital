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
    if (!formId || !user?.hospital_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parse formId to extract hospital_id, month, year
      const { hospitalId, month, year } = parseFormId(formId);

      // Fetch existing form
      const { data, error: fetchError } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 = not found
        throw fetchError;
      }

      if (data) {
        // Form exists, return it
        setForm(data);
      } else {
        // Form doesn't exist, create a new one
        const newForm: Omit<Form, "created_at" | "updated_at"> = {
          id: formId,
          hospital_id: hospitalId,
          month,
          year,
          data: {},
          submitted: false,
        };

        const { data: createdForm, error: createError } = await supabase
          .from("forms")
          .insert(newForm)
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        setForm(createdForm);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch form");
    } finally {
      setLoading(false);
    }
  };

  const saveForm = async (data: Record<string, number>) => {
    if (!form) return;

    try {
      setSaving(true);
      setError(null);

      const { error: updateError } = await supabase
        .from("forms")
        .update({
          data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", formId);

      if (updateError) {
        throw updateError;
      }

      setForm((prev) => (prev ? { ...prev, data } : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const submitForm = async (data: Record<string, number>) => {
    if (!form) return;

    try {
      setSaving(true);
      setError(null);

      const { error: updateError } = await supabase
        .from("forms")
        .update({
          data,
          submitted: true,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", formId);

      if (updateError) {
        throw updateError;
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
