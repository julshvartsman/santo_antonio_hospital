"use client";

import { Entry } from "@/types/dashboard";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "./useAuth";
import { useState } from "react";

export function useEntries() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEntry = async (data: Partial<Entry>, isDraft = true) => {
    if (!user?.hospital_id) {
      throw new Error("No hospital ID found");
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: newEntry, error: createError } = await supabase
        .from("entries")
        .insert([
          {
            ...data,
            hospital_id: user.hospital_id,
            user_id: user.id,
            submitted: !isDraft,
            submitted_at: !isDraft ? new Date().toISOString() : null,
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      return newEntry;
    } catch (err) {
      console.error("Error creating entry:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEntry = async (
    entryId: string,
    data: Partial<Entry>,
    isDraft = true
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: updatedEntry, error: updateError } = await supabase
        .from("entries")
        .update({
          ...data,
          submitted: !isDraft,
          submitted_at: !isDraft ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entryId)
        .select()
        .single();

      if (updateError) throw updateError;

      return updatedEntry;
    } catch (err) {
      console.error("Error updating entry:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (entryId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("entries")
        .delete()
        .eq("id", entryId);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error("Error deleting entry:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createEntry,
    updateEntry,
    deleteEntry,
    isLoading,
    error,
  };
}
