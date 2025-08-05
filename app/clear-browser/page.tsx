"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function ClearBrowserPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Starting cleanup...");

  useEffect(() => {
    const clearEverything = async () => {
      try {
        setStatus("🧹 Clearing localStorage...");

        // Clear all possible localStorage keys
        const keysToRemove = [
          "cityx-hospital-auth-token",
          "sb-gjckquuhfzfvgtwyybut-auth-token",
          "supabase.auth.token",
          "user",
          "user_cache_time",
          "language",
        ];

        keysToRemove.forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });

        setStatus("🔄 Clearing sessionStorage...");

        // Clear all session storage
        sessionStorage.clear();

        setStatus("🚫 Signing out from Supabase...");

        // Force sign out
        await supabase.auth.signOut();

        setStatus("✅ Cleanup complete! Ready for fresh login.");
      } catch (error) {
        console.error("Cleanup error:", error);
        setStatus("❌ Error during cleanup, but proceeding anyway...");
      }
    };

    clearEverything();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🔧 Authentication Cleanup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Clearing corrupted authentication data...
            </p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">
              {status}
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login Page
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Refresh Page
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            This clears all cached authentication data to fix login issues.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
