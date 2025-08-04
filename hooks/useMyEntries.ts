import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import type { Entry } from "@/lib/supabaseClient";

export interface MyEntriesData {
  current_month_entry?: Entry;
  historical_entries: Entry[];
  current_month_key: string;
  submission_status: {
    submitted: boolean;
    submitted_at?: string;
  };
}

export function useMyEntries() {
  const { user } = useAuth();
  const [data, setData] = useState<MyEntriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`;
  };

  const getLast12MonthsKeys = () => {
    const keys = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-01`
      );
    }

    return keys;
  };

  useEffect(() => {
    if (user) {
      fetchMyEntries();
    }
  }, [user]);

  const fetchMyEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const currentMonth = getCurrentMonthKey();
      const last12Months = getLast12MonthsKeys();

      // Fetch all entries for the current user for the last 12 months
      const { data: entries, error: entriesError } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id)
        .in("month_year", last12Months)
        .order("month_year", { ascending: true });

      if (entriesError) throw entriesError;

      const current_month_entry = entries?.find(
        (entry) => entry.month_year === currentMonth
      );
      const historical_entries = entries || [];

      setData({
        current_month_entry,
        historical_entries,
        current_month_key: currentMonth,
        submission_status: {
          submitted: current_month_entry?.submitted || false,
          submitted_at: current_month_entry?.submitted_at,
        },
      });
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching my entries:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async (formData: {
    kwh_usage: number;
    water_usage_m3: number;
    co2_emissions?: number;
  }) => {
    if (!user || !data)
      return { error: "User not authenticated or data not loaded" };

    try {
      const currentMonth = data.current_month_key;

      // Calculate CO2 emissions if not provided (simple formula)
      const co2_emissions =
        formData.co2_emissions ||
        formData.kwh_usage * 0.5 + formData.water_usage_m3 * 0.1;

      const entryData = {
        hospital_id: user.hospital_id!,
        user_id: user.id,
        month_year: currentMonth,
        kwh_usage: formData.kwh_usage,
        water_usage_m3: formData.water_usage_m3,
        co2_emissions,
        submitted: false,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (data.current_month_entry) {
        // Update existing entry
        result = await supabase
          .from("entries")
          .update(entryData)
          .eq("id", data.current_month_entry.id)
          .select()
          .single();
      } else {
        // Create new entry
        result = await supabase
          .from("entries")
          .insert([
            {
              ...entryData,
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Refresh data
      await fetchMyEntries();

      return { data: result.data, error: null };
    } catch (err: any) {
      console.error("Error saving draft:", err);
      return { data: null, error: err.message };
    }
  };

  const submitFinal = async (formData: {
    kwh_usage: number;
    water_usage_m3: number;
    co2_emissions?: number;
  }) => {
    if (!user || !data)
      return { error: "User not authenticated or data not loaded" };

    try {
      const currentMonth = data.current_month_key;

      // Calculate CO2 emissions if not provided
      const co2_emissions =
        formData.co2_emissions ||
        formData.kwh_usage * 0.5 + formData.water_usage_m3 * 0.1;

      const entryData = {
        hospital_id: user.hospital_id!,
        user_id: user.id,
        month_year: currentMonth,
        kwh_usage: formData.kwh_usage,
        water_usage_m3: formData.water_usage_m3,
        co2_emissions,
        submitted: true,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let result;

      if (data.current_month_entry) {
        // Update existing entry
        result = await supabase
          .from("entries")
          .update(entryData)
          .eq("id", data.current_month_entry.id)
          .select()
          .single();
      } else {
        // Create new entry
        result = await supabase
          .from("entries")
          .insert([
            {
              ...entryData,
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Refresh data
      await fetchMyEntries();

      return { data: result.data, error: null };
    } catch (err: any) {
      console.error("Error submitting final:", err);
      return { data: null, error: err.message };
    }
  };

  const exportToCSV = async () => {
    if (!data || !user) return;

    try {
      // Fetch all entries for this user
      const { data: allEntries, error } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id)
        .order("month_year", { ascending: true });

      if (error) throw error;

      // Convert to CSV
      const headers = [
        "Month/Year",
        "kWh Usage",
        "Water Usage (m³)",
        "CO₂ Emissions (kg)",
        "Submitted",
        "Submitted At",
      ];
      const csvContent = [
        headers.join(","),
        ...allEntries.map((entry) =>
          [
            entry.month_year,
            entry.kwh_usage,
            entry.water_usage_m3,
            entry.co2_emissions,
            entry.submitted ? "Yes" : "No",
            entry.submitted_at
              ? new Date(entry.submitted_at).toLocaleDateString()
              : "N/A",
          ].join(",")
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `sustainability-metrics-${user.id}-${
            new Date().toISOString().split("T")[0]
          }.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      console.error("Error exporting CSV:", err);
      alert("Failed to export CSV");
    }
  };

  return {
    data,
    loading,
    error,
    refresh: fetchMyEntries,
    saveDraft,
    submitFinal,
    exportToCSV,
  };
}
