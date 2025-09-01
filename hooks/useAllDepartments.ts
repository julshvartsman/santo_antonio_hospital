import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Hospital, DepartmentHead, Entry } from "@/lib/supabaseClient";

export interface HospitalWithMetrics extends Hospital {
  department_head: DepartmentHead;
  latest_entry?: Entry;
  current_month_totals: {
    kwh_usage: number;
    water_usage_m3: number;
    waste_type1: number;
    waste_type2: number;
    waste_type3: number;
    waste_type4: number;
    co2_emissions: number;
    total_kilometers_travelled?: number; // Computed sum of the three fuel types
    km_travelled_gas?: number;
    liters_consumed_gas?: number;
    km_travelled_diesel?: number;
    liters_consumed_diesel?: number;
    km_travelled_gasoline?: number;
    liters_consumed_gasoline?: number;
    renewable_energy_created?: number;
    license_plate_count?: number; // 1 if present, else 0
    fuel_efficiency_gas?: number; // km/liter for gas
    fuel_efficiency_diesel?: number; // km/liter for diesel
    fuel_efficiency_gasoline?: number; // km/liter for gasoline
  };
  previous_month_totals: {
    kwh_usage: number;
    water_usage_m3: number;
    waste_type1: number;
    waste_type2: number;
    waste_type3: number;
    waste_type4: number;
    co2_emissions: number;
    total_kilometers_travelled?: number; // Computed sum of the three fuel types
    km_travelled_gas?: number;
    liters_consumed_gas?: number;
    km_travelled_diesel?: number;
    liters_consumed_diesel?: number;
    km_travelled_gasoline?: number;
    liters_consumed_gasoline?: number;
    renewable_energy_created?: number;
    license_plate_count?: number;
    fuel_efficiency_gas?: number; // km/liter for gas
    fuel_efficiency_diesel?: number; // km/liter for diesel
    fuel_efficiency_gasoline?: number; // km/liter for gasoline
  };
  percentage_changes: {
    kwh: number;
    water: number;
    waste_type1: number;
    waste_type2: number;
    waste_type3: number;
    waste_type4: number;
    co2: number;
    kilometers?: number;
    renewable_energy?: number;
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
  total_waste_type1: number;
  total_waste_type2: number;
  total_waste_type3: number;
  total_waste_type4: number;
  total_co2: number;
  total_kilometers_travelled: number;
  total_km_gas: number;
  total_liters_gas: number;
  total_km_diesel: number;
  total_liters_diesel: number;
  total_km_gasoline: number;
  total_liters_gasoline: number;
  total_renewable_energy_created: number;
  total_license_plate_count: number;
  avg_fuel_efficiency_gas: number; // km/liter
  avg_fuel_efficiency_diesel: number; // km/liter
  avg_fuel_efficiency_gasoline: number; // km/liter
  previous_total_kwh: number;
  previous_total_water_m3: number;
  previous_total_waste_type1: number;
  previous_total_waste_type2: number;
  previous_total_waste_type3: number;
  previous_total_waste_type4: number;
  previous_total_co2: number;
  previous_total_kilometers_travelled: number;
  previous_total_km_gas: number;
  previous_total_liters_gas: number;
  previous_total_km_diesel: number;
  previous_total_liters_diesel: number;
  previous_total_km_gasoline: number;
  previous_total_liters_gasoline: number;
  previous_total_renewable_energy_created: number;
  previous_total_license_plate_count: number;
  overall_changes: {
    kwh: number;
    water: number;
    waste_type1: number;
    waste_type2: number;
    waste_type3: number;
    waste_type4: number;
    co2: number;
    kilometers: number;
    renewable_energy: number;
  };
}

// Cache for storing fetched data
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

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

  // Check if cached data is still valid
  const getCachedData = (key: string) => {
    const cached = dataCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  };

  // Set cached data with timestamp
  const setCachedData = (key: string, data: any) => {
    dataCache.set(key, { data, timestamp: Date.now() });
  };

  const fetchAllDepartmentsData = useCallback(async () => {
    try {
      console.log("🚀 DEBUG: fetchAllDepartmentsData called");
      setLoading(true);
      setError(null);

      const currentMonth = getCurrentMonthKey();
      const previousMonth = getPreviousMonthKey();
      const cacheKey = `departments_${currentMonth}_${previousMonth}`;

      // Check cache first
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setHospitals(cachedData.hospitals);
        setCumulativeMetrics(cachedData.cumulativeMetrics);
        setLoading(false);
        return;
      }

      // Fetch data in parallel for better performance
      const [hospitalsResponse, entriesResponse] = await Promise.all([
        supabase.from("hospitals").select(`
          *,
          department_heads!hospital_id (*)
        `),
        supabase
          .from("entries")
          .select("*")
          .in("month_year", [currentMonth, previousMonth]),
      ]);

      if (hospitalsResponse.error) throw hospitalsResponse.error;
      if (entriesResponse.error) throw entriesResponse.error;

      const hospitalsData = hospitalsResponse.data;
      const entriesData = entriesResponse.data;

      // Debug: Log the entries data to see what's being fetched
      console.log("🔍 Debug - Entries data fetched:", entriesData);
      console.log("🔍 Debug - Current month:", currentMonth);
      console.log("🔍 Debug - Previous month:", previousMonth);
      console.log(
        "🔍 Debug - Number of entries found:",
        entriesData?.length || 0
      );

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
            waste_type1: currentEntry?.type1 || 0,
            waste_type2: currentEntry?.type2 || 0,
            waste_type3: currentEntry?.type3 || 0,
            waste_type4: currentEntry?.type4 || 0,
            co2_emissions: currentEntry?.co2_emissions || 0,
            total_kilometers_travelled:
              (currentEntry?.km_travelled_gas || 0) +
              (currentEntry?.km_travelled_diesel || 0) +
              (currentEntry?.km_travelled_gasoline || 0),
            km_travelled_gas: currentEntry?.km_travelled_gas || 0,
            liters_consumed_gas: currentEntry?.liters_consumed_gas || 0,
            km_travelled_diesel: currentEntry?.km_travelled_diesel || 0,
            liters_consumed_diesel: currentEntry?.liters_consumed_diesel || 0,
            km_travelled_gasoline: currentEntry?.km_travelled_gasoline || 0,
            liters_consumed_gasoline: currentEntry?.liters_consumed_gasoline || 0,
            renewable_energy_created:
              currentEntry?.renewable_energy_created || 0,
            license_plate_count: currentEntry?.license_plate ? 1 : 0,
            fuel_efficiency_gas: (currentEntry?.liters_consumed_gas && currentEntry?.liters_consumed_gas > 0) 
              ? (currentEntry?.km_travelled_gas || 0) / currentEntry.liters_consumed_gas
              : 0,
            fuel_efficiency_diesel: (currentEntry?.liters_consumed_diesel && currentEntry?.liters_consumed_diesel > 0)
              ? (currentEntry?.km_travelled_diesel || 0) / currentEntry.liters_consumed_diesel
              : 0,
            fuel_efficiency_gasoline: (currentEntry?.liters_consumed_gasoline && currentEntry?.liters_consumed_gasoline > 0)
              ? (currentEntry?.km_travelled_gasoline || 0) / currentEntry.liters_consumed_gasoline
              : 0,
          };

          const previous_month_totals = {
            kwh_usage: previousEntry?.kwh_usage || 0,
            water_usage_m3: previousEntry?.water_usage_m3 || 0,
            waste_type1: previousEntry?.type1 || 0,
            waste_type2: previousEntry?.type2 || 0,
            waste_type3: previousEntry?.type3 || 0,
            waste_type4: previousEntry?.type4 || 0,
            co2_emissions: previousEntry?.co2_emissions || 0,
            total_kilometers_travelled:
              (previousEntry?.km_travelled_gas || 0) +
              (previousEntry?.km_travelled_diesel || 0) +
              (previousEntry?.km_travelled_gasoline || 0),
            km_travelled_gas: previousEntry?.km_travelled_gas || 0,
            liters_consumed_gas: previousEntry?.liters_consumed_gas || 0,
            km_travelled_diesel: previousEntry?.km_travelled_diesel || 0,
            liters_consumed_diesel: previousEntry?.liters_consumed_diesel || 0,
            km_travelled_gasoline: previousEntry?.km_travelled_gasoline || 0,
            liters_consumed_gasoline: previousEntry?.liters_consumed_gasoline || 0,
            renewable_energy_created:
              previousEntry?.renewable_energy_created || 0,
            license_plate_count: previousEntry?.license_plate ? 1 : 0,
            fuel_efficiency_gas: (previousEntry?.liters_consumed_gas && previousEntry?.liters_consumed_gas > 0) 
              ? (previousEntry?.km_travelled_gas || 0) / previousEntry.liters_consumed_gas
              : 0,
            fuel_efficiency_diesel: (previousEntry?.liters_consumed_diesel && previousEntry?.liters_consumed_diesel > 0)
              ? (previousEntry?.km_travelled_diesel || 0) / previousEntry.liters_consumed_diesel
              : 0,
            fuel_efficiency_gasoline: (previousEntry?.liters_consumed_gasoline && previousEntry?.liters_consumed_gasoline > 0)
              ? (previousEntry?.km_travelled_gasoline || 0) / previousEntry.liters_consumed_gasoline
              : 0,
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
            kilometers:
              (previous_month_totals.total_kilometers_travelled || 0) > 0
                ? (((current_month_totals.total_kilometers_travelled || 0) -
                    (previous_month_totals.total_kilometers_travelled || 0)) /
                    (previous_month_totals.total_kilometers_travelled || 1)) *
                  100
                : 0,
            renewable_energy:
              (previous_month_totals.renewable_energy_created || 0) > 0
                ? (((current_month_totals.renewable_energy_created || 0) -
                    (previous_month_totals.renewable_energy_created || 0)) /
                    (previous_month_totals.renewable_energy_created || 1)) *
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

      // Debug: Log processed hospitals data
      console.log("🔍 Debug - Processed hospitals:", processedHospitals);
      console.log("🔍 Debug - Sample hospital data:", processedHospitals[0]);
      console.log(
        "🔍 Debug - Sample current_month_totals:",
        processedHospitals[0]?.current_month_totals
      );
      console.log(
        "🔍 Debug - Sample previous_month_totals:",
        processedHospitals[0]?.previous_month_totals
      );

      // Calculate cumulative metrics
      console.log("🔍 Debug - Starting cumulative metrics calculation");
      const cumulative: CumulativeMetrics = {
        total_kwh: processedHospitals.reduce(
          (sum, h) => sum + h.current_month_totals.kwh_usage,
          0
        ),
        total_water_m3: processedHospitals.reduce(
          (sum, h) => sum + h.current_month_totals.water_usage_m3,
          0
        ),
        total_waste_type1: processedHospitals.reduce(
          (sum, h) => sum + h.current_month_totals.waste_type1,
          0
        ),
        total_waste_type2: processedHospitals.reduce(
          (sum, h) => sum + h.current_month_totals.waste_type2,
          0
        ),
        total_waste_type3: processedHospitals.reduce(
          (sum, h) => sum + h.current_month_totals.waste_type3,
          0
        ),
        total_waste_type4: processedHospitals.reduce(
          (sum, h) => sum + h.current_month_totals.waste_type4,
          0
        ),
        total_co2: processedHospitals.reduce(
          (sum, h) => sum + h.current_month_totals.co2_emissions,
          0
        ),
        total_kilometers_travelled: processedHospitals.reduce(
          (sum, h) => sum + (h.current_month_totals.total_kilometers_travelled || 0),
          0
        ),
        total_renewable_energy_created: processedHospitals.reduce(
          (sum, h) =>
            sum + (h.current_month_totals.renewable_energy_created || 0),
          0
        ),
        total_km_gas: processedHospitals.reduce(
          (sum, h) => sum + (h.current_month_totals.km_travelled_gas || 0),
          0
        ),
        total_liters_gas: processedHospitals.reduce(
          (sum, h) => sum + (h.current_month_totals.liters_consumed_gas || 0),
          0
        ),
        total_km_diesel: processedHospitals.reduce(
          (sum, h) => sum + (h.current_month_totals.km_travelled_diesel || 0),
          0
        ),
        total_liters_diesel: processedHospitals.reduce(
          (sum, h) => sum + (h.current_month_totals.liters_consumed_diesel || 0),
          0
        ),
        total_km_gasoline: processedHospitals.reduce(
          (sum, h) => sum + (h.current_month_totals.km_travelled_gasoline || 0),
          0
        ),
        total_liters_gasoline: processedHospitals.reduce(
          (sum, h) => sum + (h.current_month_totals.liters_consumed_gasoline || 0),
          0
        ),
        total_license_plate_count: processedHospitals.reduce(
          (sum, h) => sum + (h.current_month_totals.license_plate_count || 0),
          0
        ),
        avg_fuel_efficiency_gas: 0, // Will be calculated below
        avg_fuel_efficiency_diesel: 0, // Will be calculated below
        avg_fuel_efficiency_gasoline: 0, // Will be calculated below
        previous_total_kwh: processedHospitals.reduce(
          (sum, h) => sum + h.previous_month_totals.kwh_usage,
          0
        ),
        previous_total_water_m3: processedHospitals.reduce(
          (sum, h) => sum + h.previous_month_totals.water_usage_m3,
          0
        ),
        previous_total_waste_type1: processedHospitals.reduce(
          (sum, h) => sum + h.previous_month_totals.waste_type1,
          0
        ),
        previous_total_waste_type2: processedHospitals.reduce(
          (sum, h) => sum + h.previous_month_totals.waste_type2,
          0
        ),
        previous_total_waste_type3: processedHospitals.reduce(
          (sum, h) => sum + h.previous_month_totals.waste_type3,
          0
        ),
        previous_total_waste_type4: processedHospitals.reduce(
          (sum, h) => sum + h.previous_month_totals.waste_type4,
          0
        ),
        previous_total_co2: processedHospitals.reduce(
          (sum, h) => sum + h.previous_month_totals.co2_emissions,
          0
        ),
        previous_total_kilometers_travelled: processedHospitals.reduce(
          (sum, h) => sum + (h.previous_month_totals.total_kilometers_travelled || 0),
          0
        ),
        previous_total_renewable_energy_created: processedHospitals.reduce(
          (sum, h) =>
            sum + (h.previous_month_totals.renewable_energy_created || 0),
          0
        ),
        previous_total_km_gas: processedHospitals.reduce(
          (sum, h) => sum + (h.previous_month_totals.km_travelled_gas || 0),
          0
        ),
        previous_total_liters_gas: processedHospitals.reduce(
          (sum, h) => sum + (h.previous_month_totals.liters_consumed_gas || 0),
          0
        ),
        previous_total_km_diesel: processedHospitals.reduce(
          (sum, h) => sum + (h.previous_month_totals.km_travelled_diesel || 0),
          0
        ),
        previous_total_liters_diesel: processedHospitals.reduce(
          (sum, h) => sum + (h.previous_month_totals.liters_consumed_diesel || 0),
          0
        ),
        previous_total_km_gasoline: processedHospitals.reduce(
          (sum, h) =>
            sum + (h.previous_month_totals.km_travelled_gasoline || 0),
          0
        ),
        previous_total_liters_gasoline: processedHospitals.reduce(
          (sum, h) => sum + (h.previous_month_totals.liters_consumed_gasoline || 0),
          0
        ),
        previous_total_license_plate_count: processedHospitals.reduce(
          (sum, h) => sum + (h.previous_month_totals.license_plate_count || 0),
          0
        ),
        overall_changes: {
          kwh: 0, // Will be calculated below
          water: 0,
          waste_type1: 0,
          waste_type2: 0,
          waste_type3: 0,
          waste_type4: 0,
          co2: 0,
          kilometers: 0,
          renewable_energy: 0,
        },
      };

      // Calculate average fuel efficiency
      cumulative.avg_fuel_efficiency_gas = cumulative.total_liters_gas > 0 
        ? cumulative.total_km_gas / cumulative.total_liters_gas 
        : 0;
      cumulative.avg_fuel_efficiency_diesel = cumulative.total_liters_diesel > 0 
        ? cumulative.total_km_diesel / cumulative.total_liters_diesel 
        : 0;
      cumulative.avg_fuel_efficiency_gasoline = cumulative.total_liters_gasoline > 0 
        ? cumulative.total_km_gasoline / cumulative.total_liters_gasoline 
        : 0;

      console.log("🔍 Debug - Cumulative metrics calculated:", cumulative);
      console.log("🔍 Debug - New fields totals:", {
        total_kilometers_travelled: cumulative.total_kilometers_travelled,
        total_km_gas: cumulative.total_km_gas,
        total_km_diesel: cumulative.total_km_diesel,
        total_km_gasoline: cumulative.total_km_gasoline,
        total_renewable_energy_created:
          cumulative.total_renewable_energy_created,
        total_license_plate_count: cumulative.total_license_plate_count,
      });

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
        waste_type1:
          cumulative.previous_total_waste_type1 > 0
            ? ((cumulative.total_waste_type1 -
                cumulative.previous_total_waste_type1) /
                cumulative.previous_total_waste_type1) *
              100
            : 0,
        waste_type2:
          cumulative.previous_total_waste_type2 > 0
            ? ((cumulative.total_waste_type2 -
                cumulative.previous_total_waste_type2) /
                cumulative.previous_total_waste_type2) *
              100
            : 0,
        waste_type3:
          cumulative.previous_total_waste_type3 > 0
            ? ((cumulative.total_waste_type3 -
                cumulative.previous_total_waste_type3) /
                cumulative.previous_total_waste_type3) *
              100
            : 0,
        waste_type4:
          cumulative.previous_total_waste_type4 > 0
            ? ((cumulative.total_waste_type4 -
                cumulative.previous_total_waste_type4) /
                cumulative.previous_total_waste_type4) *
              100
            : 0,
        co2:
          cumulative.previous_total_co2 > 0
            ? ((cumulative.total_co2 - cumulative.previous_total_co2) /
                cumulative.previous_total_co2) *
              100
            : 0,
        kilometers:
          cumulative.previous_total_kilometers_travelled > 0
            ? ((cumulative.total_kilometers_travelled -
                cumulative.previous_total_kilometers_travelled) /
                cumulative.previous_total_kilometers_travelled) *
              100
            : 0,
        renewable_energy:
          cumulative.previous_total_renewable_energy_created > 0
            ? ((cumulative.total_renewable_energy_created -
                cumulative.previous_total_renewable_energy_created) /
                cumulative.previous_total_renewable_energy_created) *
              100
            : 0,
      };

      // Cache the results
      setCachedData(cacheKey, {
        hospitals: processedHospitals,
        cumulativeMetrics: cumulative,
      });

      setHospitals(processedHospitals);
      setCumulativeMetrics(cumulative);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching departments data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDepartmentsData();
  }, [fetchAllDepartmentsData]);

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

      // Optionally: instead of writing to a notifications table, also write a support message entry
      // so it shows up in the computed notifications API as a "Reminder sent" info item.
      await supabase.from("support_messages").insert({
        from_name: "Hospital Sustainability Team",
        from_email: "noreply@hospital.com",
        from_phone: null,
        message: `Reminder: ${message}`,
        user_id: departmentHeadId,
        status: "resolved",
        admin_response: message,
        resolved_at: new Date().toISOString(),
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
