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

      // Get current date
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Generate the last 12 months of form IDs
      const formIds: string[] = [];
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const formId = `${user.hospital_id}-${month
          .toString()
          .padStart(2, "0")}-${year}`;
        formIds.push(formId);
      }

      // Fetch forms from Supabase
      const { data, error: fetchError } = await supabase
        .from("forms")
        .select("id, month, year, submitted, submitted_at")
        .in("id", formIds)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform data to include form_name and ensure all 12 months are represented
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

      const formsMap = new Map<string, FormListEntry>();

      // Initialize all 12 months
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const formId = `${user.hospital_id}-${month
          .toString()
          .padStart(2, "0")}-${year}`;

        formsMap.set(formId, {
          id: formId,
          month,
          year,
          submitted: false,
          form_name: `${monthNames[month - 1]} ${year}`,
        });
      }

      // Update with actual data from database
      if (data) {
        data.forEach((form) => {
          const formName = `${monthNames[form.month - 1]} ${form.year}`;
          formsMap.set(form.id, {
            ...form,
            form_name: formName,
          });
        });
      }

      setForms(Array.from(formsMap.values()));
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
