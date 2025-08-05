"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DebugDashboard() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [profileInfo, setProfileInfo] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      console.log("=== DEBUG DASHBOARD SESSION CHECK ===");

      // Check current session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      console.log("Session data:", sessionData);
      console.log("Session error:", sessionError);
      setSessionInfo({ sessionData, sessionError });

      // If there's a session, try to fetch profile directly
      if (sessionData.session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionData.session.user.id)
          .single();

        console.log("Direct profile fetch:", profile);
        console.log("Profile error:", profileError);
        setProfileInfo({ profile, profileError });
      }
    };

    checkSession();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-xl font-bold mb-4">Loading...</h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>🔍 User Debug Dashboard</CardTitle>
          <p className="text-sm text-gray-600">
            {user ? "✅ User found" : "❌ User is NULL - Profile fetch failed"}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold">Auth Hook User:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {user
                ? JSON.stringify(user, null, 2)
                : "❌ NULL - This is the problem!"}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">Raw Session Data:</h3>
            <pre className="bg-blue-50 p-4 rounded text-sm overflow-auto max-h-40">
              {sessionInfo
                ? JSON.stringify(sessionInfo, null, 2)
                : "Loading..."}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">Direct Profile Fetch:</h3>
            <pre className="bg-green-50 p-4 rounded text-sm overflow-auto max-h-40">
              {profileInfo
                ? JSON.stringify(profileInfo, null, 2)
                : "Loading..."}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Navigation Tests:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => router.push("/admin/dashboard")}
                variant="outline"
              >
                Test Admin Dashboard
              </Button>
              <Button
                onClick={() => router.push("/department/dashboard")}
                variant="outline"
              >
                Test Department Dashboard
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Actions:</h3>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/login")} variant="outline">
                Back to Login
              </Button>
              <Button onClick={logout} variant="destructive">
                Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
