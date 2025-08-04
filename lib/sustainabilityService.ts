import { supabase } from "./supabaseClient";
import type { Entry as SustainabilityMetric } from "./supabaseClient";

export class SustainabilityService {
  // Fetch all sustainability metrics
  static async getMetrics() {
    const { data, error } = await supabase
      .from("sustainability_metrics")
      .select("*")
      .order("created_at", { ascending: false });

    return { data, error };
  }

  // Fetch metrics by category
  static async getMetricsByCategory(category: string) {
    const { data, error } = await supabase
      .from("sustainability_metrics")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });

    return { data, error };
  }

  // Create a new metric
  static async createMetric(
    metric: Omit<SustainabilityMetric, "id" | "created_at" | "updated_at">
  ) {
    const { data, error } = await supabase
      .from("sustainability_metrics")
      .insert([metric])
      .select();

    return { data, error };
  }
}
