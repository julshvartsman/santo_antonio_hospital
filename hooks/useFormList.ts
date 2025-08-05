import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FormListEntry } from "@/types/forms";
import { useAuth } from "./useAuth";

export const useMyFormList = () => {
  const [forms, setForms] = useState<FormListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const fetchForms = async () => {
    if (!user?.hospital_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Generate all 12 months for the current year
      const currentYear = new Date().getFullYear();
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      // Create base forms for all 12 months
      const baseForms: FormListEntry[] = Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        const formId = `${user.hospital_id}-${month.toString().padStart(2, '0')}-${currentYear}`;
        return {
          id: formId,
          month,
          year: currentYear,
          form_name: `${monthNames[month - 1]} ${currentYear}`,
          submitted: false,
          submitted_at: null,
        };
      });

      // Fetch existing forms from database to update status
      const { data: existingForms, error: fetchError } = await supabase
        .from("forms")
        .select("id, month, year, submitted, submitted_at")
        .eq("hospital_id", user.hospital_id)
        .eq("year", currentYear);

      if (fetchError) {
        throw fetchError;
      }

      // Merge existing forms with base forms
      const forms = baseForms.map(baseForm => {
        const existingForm = existingForms?.find(ef => ef.id === baseForm.id);
        if (existingForm) {
          return {
            ...baseForm,
            submitted: existingForm.submitted,
            submitted_at: existingForm.submitted_at,
          };
        }
        return baseForm;
      });

      setForms(forms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [user?.hospital_id]);

  return {
    forms,
    loading,
    error,
    refresh: fetchForms,
  };
};
