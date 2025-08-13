"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CheckRolePage() {
  const { user, isLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfileData(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRoleToAdmin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", user?.id);

      if (error) {
        console.error("Error updating role:", error);
        alert("Error updating role: " + error.message);
      } else {
        alert("Role updated to admin successfully!");
        fetchProfileData();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating role");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#225384] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Role Checker</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Auth User Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>ID:</strong> {user?.id}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Name:</strong> {user?.name}
              </p>
              <p>
                <strong>Role:</strong>
                <Badge
                  variant={user?.role === "admin" ? "default" : "secondary"}
                  className="ml-2"
                >
                  {user?.role || "No role"}
                </Badge>
              </p>
              <p>
                <strong>Hospital ID:</strong> {user?.hospital_id || "None"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Profile Data</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#225384]"></div>
            ) : profileData ? (
              <div className="space-y-2">
                <p>
                  <strong>ID:</strong> {profileData.id}
                </p>
                <p>
                  <strong>Email:</strong> {profileData.email}
                </p>
                <p>
                  <strong>Full Name:</strong> {profileData.full_name}
                </p>
                <p>
                  <strong>Role:</strong>
                  <Badge
                    variant={
                      profileData.role === "admin" ? "default" : "secondary"
                    }
                    className="ml-2"
                  >
                    {profileData.role || "No role"}
                  </Badge>
                </p>
                <p>
                  <strong>Hospital ID:</strong>{" "}
                  {profileData.hospital_id || "None"}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(profileData.created_at).toLocaleString()}
                </p>
                <p>
                  <strong>Updated At:</strong>{" "}
                  {new Date(profileData.updated_at).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No profile data found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                onClick={updateRoleToAdmin}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Updating..." : "Update Role to Admin"}
              </Button>
              <Button
                onClick={fetchProfileData}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Refresh Profile Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
