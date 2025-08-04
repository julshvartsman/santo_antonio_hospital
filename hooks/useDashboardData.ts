"use client";

import { DepartmentDashboardData, AdminDashboardData } from "@/types/dashboard";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export function useDepartmentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DepartmentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.hospital_id) {
          throw new Error("No hospital ID found");
        }

        // Fetch hospital data
        const { data: hospital, error: hospitalError } = await supabase
          .from("hospitals")
          .select("*")
          .eq("id", user.hospital_id)
          .single();

        if (hospitalError) throw hospitalError;

        // Fetch current month's entry
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: currentEntry, error: entryError } = await supabase
          .from("entries")
          .select("*")
          .eq("hospital_id", user.hospital_id)
          .gte("month_year", startOfMonth.toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (entryError && entryError.code !== "PGRST116") throw entryError;

        // Fetch historical entries (last 12 months)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const { data: historicalEntries, error: historyError } = await supabase
          .from("entries")
          .select("*")
          .eq("hospital_id", user.hospital_id)
          .gte("month_year", oneYearAgo.toISOString())
          .order("month_year", { ascending: true });

        if (historyError) throw historyError;

        // Fetch team members
        const { data: teamMembers, error: teamError } = await supabase
          .from("profiles")
          .select("*")
          .eq("hospital_id", user.hospital_id);

        if (teamError) throw teamError;

        // Set dashboard data
        setData({
          hospital,
          currentMonthEntry: currentEntry || undefined,
          historicalEntries,
          teamMembers,
          monthlyTargets: {
            kwh_target: 10000, // Example targets - replace with actual logic
            water_target: 1000,
            co2_target: 500,
          },
        });
      } catch (err) {
        console.error("Error fetching department dashboard data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.hospital_id) {
      fetchData();
    }
  }, [user?.hospital_id]);

  return { data, isLoading, error };
}

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all hospitals
        const { data: hospitals, error: hospitalError } = await supabase
          .from("hospitals")
          .select("*");

        if (hospitalError) throw hospitalError;

        // Fetch all entries for the current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: currentEntries, error: entriesError } = await supabase
          .from("entries")
          .select("*")
          .gte("month_year", startOfMonth.toISOString());

        if (entriesError) throw entriesError;

        // Calculate submission status
        const submissionStatus = hospitals.map((hospital) => {
          const hospitalEntry = currentEntries.find(
            (entry) => entry.hospital_id === hospital.id
          );
          return {
            hospitalId: hospital.id,
            hospitalName: hospital.name,
            hasSubmittedThisMonth: hospitalEntry?.submitted || false,
            lastSubmissionDate: hospitalEntry?.submitted_at,
          };
        });

        // Calculate system metrics
        const systemMetrics = {
          totalHospitals: hospitals.length,
          hospitalsSubmittedThisMonth: submissionStatus.filter(
            (status) => status.hasSubmittedThisMonth
          ).length,
          averageKwhUsage:
            currentEntries.reduce((acc, entry) => acc + entry.kwh_usage, 0) /
            currentEntries.length,
          averageWaterUsage:
            currentEntries.reduce(
              (acc, entry) => acc + entry.water_usage_m3,
              0
            ) / currentEntries.length,
          averageCo2Emissions:
            currentEntries.reduce(
              (acc, entry) => acc + entry.co2_emissions,
              0
            ) / currentEntries.length,
        };

        setData({
          hospitals,
          allEntries: currentEntries,
          submissionStatus,
          systemMetrics,
        });
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
}
