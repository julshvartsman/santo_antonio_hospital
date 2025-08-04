import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Hospital, DepartmentHead, Entry } from "@/lib/supabaseClient";

export interface HospitalWithMetrics extends Hospital {
  department_head: DepartmentHead;
  latest_entry?: Entry;
  current_month_totals: {
    kwh_usage: number;
    water_usage_m3: number;
    co2_emissions: number;
  };
  previous_month_totals: {
    kwh_usage: number;
    water_usage_m3: number;
    co2_emissions: number;
  };
  percentage_changes: {
    kwh: number;
    water: number;
    co2: number;
  };
  isOutlier: boolean;
  submission_status: {
    submitted: boolean;
    submitted_at?: string;
  };
}

export interface CumulativeMetrics {
  total_kwh: number;
  total_water_m3: number;
  total_co2: number;
  previous_total_kwh: number;
  previous_total_water_m3: number;
  previous_total_co2: number;
  overall_changes: {
    kwh: number;
    water: number;
    co2: number;
  };
}

export function useAllDepartments() {
  const [hospitals, setHospitals] = useState<HospitalWithMetrics[]>([]);
  const [cumulativeMetrics, setCumulativeMetrics] =
    useState<CumulativeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateIsOutlier = (value: number, allValues: number[]): boolean => {
    if (allValues.length < 3) return false;

    const mean =
      allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
    const stdDev = Math.sqrt(
      allValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        allValues.length
    );

    return Math.abs(value - mean) > 2 * stdDev; // 2 standard deviations
  };

  const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`;
  };

  const getPreviousMonthKey = () => {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${prevMonth.getFullYear()}-${String(
      prevMonth.getMonth() + 1
    ).padStart(2, "0")}-01`;
  };

  useEffect(() => {
    fetchAllDepartmentsData();
  }, []);

  const fetchAllDepartmentsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentMonth = getCurrentMonthKey();
      const previousMonth = getPreviousMonthKey();

      // Fetch all hospitals with their department heads
      const { data: hospitalsData, error: hospitalsError } =
        await supabase.from("hospitals").select(`
          *,
          department_heads!hospital_id (*)
        `);

      if (hospitalsError) throw hospitalsError;

      // Fetch all entries for current and previous month
      const { data: entriesData, error: entriesError } = await supabase
        .from("entries")
        .select("*")
        .in("month_year", [currentMonth, previousMonth]);

      if (entriesError) throw entriesError;

      // Process data for each hospital
      const processedHospitals: HospitalWithMetrics[] = hospitalsData.map(
        (hospital) => {
          const departmentHead = hospital.department_heads[0]; // Assuming one head per hospital

          const currentEntry = entriesData.find(
            (entry) =>
              entry.hospital_id === hospital.id &&
              entry.month_year === currentMonth
          );

          const previousEntry = entriesData.find(
            (entry) =>
              entry.hospital_id === hospital.id &&
              entry.month_year === previousMonth
          );

          const current_month_totals = {
            kwh_usage: currentEntry?.kwh_usage || 0,
            water_usage_m3: currentEntry?.water_usage_m3 || 0,
            co2_emissions: currentEntry?.co2_emissions || 0,
          };

          const previous_month_totals = {
            kwh_usage: previousEntry?.kwh_usage || 0,
            water_usage_m3: previousEntry?.water_usage_m3 || 0,
            co2_emissions: previousEntry?.co2_emissions || 0,
          };

          const percentage_changes = {
            kwh:
              previous_month_totals.kwh_usage > 0
                ? ((current_month_totals.kwh_usage -
                    previous_month_totals.kwh_usage) /
                    previous_month_totals.kwh_usage) *
                  100
                : 0,
            water:
              previous_month_totals.water_usage_m3 > 0
                ? ((current_month_totals.water_usage_m3 -
                    previous_month_totals.water_usage_m3) /
                    previous_month_totals.water_usage_m3) *
                  100
                : 0,
            co2:
              previous_month_totals.co2_emissions > 0
                ? ((current_month_totals.co2_emissions -
                    previous_month_totals.co2_emissions) /
                    previous_month_totals.co2_emissions) *
                  100
                : 0,
          };

          return {
            ...hospital,
            department_head: departmentHead,
            latest_entry: currentEntry,
            current_month_totals,
            previous_month_totals,
            percentage_changes,
            isOutlier: false, // Will be calculated after all data is processed
            submission_status: {
              submitted: currentEntry?.submitted || false,
              submitted_at: currentEntry?.submitted_at,
            },
          };
        }
      );

      // Calculate outliers
      const allKwhValues = processedHospitals.map(
        (h) => h.current_month_totals.kwh_usage
      );
      const allWaterValues = processedHospitals.map(
        (h) => h.current_month_totals.water_usage_m3
      );
      const allCo2Values = processedHospitals.map(
        (h) => h.current_month_totals.co2_emissions
      );

      processedHospitals.forEach((hospital) => {
        hospital.isOutlier =
          calculateIsOutlier(
            hospital.current_month_totals.kwh_usage,
            allKwhValues
          ) ||
          calculateIsOutlier(
            hospital.current_month_totals.water_usage_m3,
            allWaterValues
          ) ||
          calculateIsOutlier(
            hospital.current_month_totals.co2_emissions,
            allCo2Values
          );
      });

      // Calculate cumulative metrics
      const cumulative: CumulativeMetrics = {
        total_kwh: processedHospitals.reduce(
          (sum, h) => sum + h.current_month_totals.kwh_usage,
          0
        ),
        total_water_m3: processedHospitals.reduce(
          (sum, h) => sum + h.current_month_totals.water_usage_m3,
          0
        ),
        total_co2: processedHospitals.reduce(
          (sum, h) => sum + h.current_month_totals.co2_emissions,
          0
        ),
        previous_total_kwh: processedHospitals.reduce(
          (sum, h) => sum + h.previous_month_totals.kwh_usage,
          0
        ),
        previous_total_water_m3: processedHospitals.reduce(
          (sum, h) => sum + h.previous_month_totals.water_usage_m3,
          0
        ),
        previous_total_co2: processedHospitals.reduce(
          (sum, h) => sum + h.previous_month_totals.co2_emissions,
          0
        ),
        overall_changes: {
          kwh: 0, // Will be calculated below
          water: 0,
          co2: 0,
        },
      };

      // Calculate overall percentage changes
      cumulative.overall_changes = {
        kwh:
          cumulative.previous_total_kwh > 0
            ? ((cumulative.total_kwh - cumulative.previous_total_kwh) /
                cumulative.previous_total_kwh) *
              100
            : 0,
        water:
          cumulative.previous_total_water_m3 > 0
            ? ((cumulative.total_water_m3 -
                cumulative.previous_total_water_m3) /
                cumulative.previous_total_water_m3) *
              100
            : 0,
        co2:
          cumulative.previous_total_co2 > 0
            ? ((cumulative.total_co2 - cumulative.previous_total_co2) /
                cumulative.previous_total_co2) *
              100
            : 0,
      };

      setHospitals(processedHospitals);
      setCumulativeMetrics(cumulative);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching departments data:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendReminderToHead = async (
    departmentHeadId: string,
    hospitalName: string
  ) => {
    try {
      // Mock WhatsApp notification - replace with actual implementation
      const message = `Reminder: Please submit your monthly sustainability metrics for ${hospitalName}`;

      // In a real implementation, you would:
      // 1. Get the department head's phone number
      // 2. Use a service like Twilio to send WhatsApp message
      // 3. Or trigger a Supabase Edge Function

      console.log(`Sending reminder to ${departmentHeadId}: ${message}`);

      // You could also create a notification record in the database
      await supabase.from("notifications").insert({
        user_id: departmentHeadId,
        type: "reminder",
        title: "Monthly Submission Reminder",
        message: message,
        created_at: new Date().toISOString(),
      });

      alert("Reminder sent successfully!");
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Failed to send reminder");
    }
  };

  return {
    hospitals,
    cumulativeMetrics,
    loading,
    error,
    refresh: fetchAllDepartmentsData,
    sendReminderToHead,
  };
}
