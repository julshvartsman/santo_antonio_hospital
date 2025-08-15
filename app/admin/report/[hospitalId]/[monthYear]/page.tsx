"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Edit,
  Save,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

interface ReportData {
  hospital_name: string;
  month: number;
  year: number;
  kwh_usage: number;
  water_usage_m3: number;
  waste_type1: number;
  waste_type2: number;
  waste_type3: number;
  waste_type4: number;
  co2_emissions: number;
  fuel_type?: string;
  kilometers_travelled?: number;
  license_plate?: string;
  renewable_energy_created?: number;
  submitted: boolean;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function HospitalReportPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const hospitalId = params.hospitalId as string;
  const monthYear = params.monthYear as string;

  console.log("Report page params:", { hospitalId, monthYear, params });

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<ReportData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check authentication first
    if (authLoading) return;

    if (!user) {
      // Add a small delay to ensure auth state is properly initialized
      const timer = setTimeout(() => {
        if (!user) {
          router.push("/login");
        }
      }, 1000);

      return () => clearTimeout(timer);
    }

    // Check if user is admin and fetch data
    const checkAdminAndFetchData = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile error:", profileError);
          setError("Error checking admin status. Please try again.");
          setLoading(false);
          return;
        }

        console.log("User role from profile:", profile?.role);
        console.log("User role from auth:", user.role);

        // Check both the profile role and the auth user role
        const hasAdminAccess =
          profile?.role === "admin" ||
          profile?.role === "super_admin" ||
          user.role === "admin" ||
          user.role === "super_admin";

        if (!hasAdminAccess) {
          setError(
            `Access denied. Admin privileges required. Current role: ${
              profile?.role || user.role
            }`
          );
          setLoading(false);
          return;
        }

        // If admin, fetch the report data
        await fetchReportData();
      } catch (error) {
        console.error("Error in admin check:", error);
        setError("Error checking permissions. Please try again.");
        setLoading(false);
      }
    };

    checkAdminAndFetchData();
  }, [user, authLoading, hospitalId, monthYear, router]);

  const fetchReportData = async () => {
    try {
      console.log("Starting fetchReportData...");
      setLoading(true);
      setError(null);

      // Parse month and year from the URL parameter
      const [year, month] = monthYear.split("-").map(Number);
      console.log("Parsed params:", { hospitalId, year, month, monthYear });

      // First try to fetch from entries table (which has the actual metrics data)
      console.log("Trying to fetch from entries table...");
      const monthYearKey = `${year}-${String(month).padStart(2, "0")}-01`;
      console.log("Fetching from entries with key:", monthYearKey);

      const { data: entriesData, error: entriesError } = await supabase
        .from("entries")
        .select(
          `
          *,
          hospitals!hospital_id (
            name
          )
        `
        )
        .eq("hospital_id", hospitalId)
        .eq("month_year", monthYearKey)
        .single();

      if (entriesError && !entriesError.message.includes("No rows returned")) {
        console.error("Entries table error:", entriesError);
        throw entriesError;
      }

      // If no entries data, try forms table for submission status
      if (!entriesData) {
        console.log("No entries data found, trying forms table...");
        const { data: formData, error: formError } = await supabase
          .from("forms")
          .select(
            `
            *,
            hospitals!hospital_id (
              name
            )
          `
          )
          .eq("hospital_id", hospitalId)
          .eq("month", month)
          .eq("year", year)
          .single();

        if (formError && !formError.message.includes("No rows returned")) {
          console.error("Forms table error:", formError);
          throw formError;
        }

        if (formData) {
          // Use form data (only submission status, no metrics)
          console.log("Found form data:", formData);
          setReportData({
            hospital_name: formData.hospitals?.name || "Unknown Hospital",
            month: formData.month,
            year: formData.year,
            kwh_usage: 0, // Forms table doesn't have metrics data
            water_usage_m3: 0,
            waste_type1: 0,
            waste_type2: 0,
            waste_type3: 0,
            waste_type4: 0,
            co2_emissions: 0,
            fuel_type: "",
            kilometers_travelled: 0,
            license_plate: "",
            renewable_energy_created: 0,
            submitted: formData.submitted,
            submitted_at: formData.submitted_at,
            created_at: formData.created_at,
            updated_at: formData.updated_at,
          });
        } else {
          console.log("No data found in either table");
          setError(
            "No data found for this hospital and month. The report may not exist yet or the data hasn't been submitted."
          );
        }
      } else {
        // Use entries data (has both metrics and submission status)
        console.log("Found entries data:", entriesData);
        setReportData({
          hospital_name: entriesData.hospitals?.name || "Unknown Hospital",
          month,
          year,
          kwh_usage: entriesData.kwh_usage || 0,
          water_usage_m3: entriesData.water_usage_m3 || 0,
          waste_type1: entriesData.type1 || 0,
          waste_type2: entriesData.type2 || 0,
          waste_type3: entriesData.type3 || 0,
          waste_type4: entriesData.type4 || 0,
          co2_emissions: entriesData.co2_emissions || 0,
          fuel_type: entriesData.fuel_type || "",
          kilometers_travelled: entriesData.kilometers_travelled || 0,
          license_plate: entriesData.license_plate || "",
          renewable_energy_created: entriesData.renewable_energy_created || 0,
          submitted: entriesData.submitted || false,
          submitted_at: entriesData.submitted_at,
          created_at: entriesData.created_at,
          updated_at: entriesData.updated_at,
        });
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!reportData) return;

    // Create a CSV report
    const csvContent = [
      "Hospital Report",
      `Hospital: ${reportData.hospital_name}`,
      `Month/Year: ${new Date(
        reportData.year,
        reportData.month - 1
      ).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      "",
      "Metric,Value,Unit",
      `Electricity Usage,${reportData.kwh_usage},kWh`,
      `Water Usage,${reportData.water_usage_m3},m³`,
      `Type 1 Waste,${reportData.waste_type1},kg`,
      `Type 2 Waste,${reportData.waste_type2},kg`,
      `Type 3 Waste,${reportData.waste_type3},kg`,
      `Type 4 Waste,${reportData.waste_type4},kg`,
      `CO₂ Emissions,${reportData.co2_emissions},kg CO₂e`,
      "",
      `Submission Status,${reportData.submitted ? "Submitted" : "Pending"}`,
      reportData.submitted_at
        ? `Submitted At,${new Date(reportData.submitted_at).toLocaleString()}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportData.hospital_name}_${reportData.year}-${String(
      reportData.month
    ).padStart(2, "0")}_report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleEdit = () => {
    if (reportData) {
      setEditableData({ ...reportData });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableData(null);
  };

  const handleSave = async () => {
    if (!editableData) return;

    try {
      setSaving(true);

      // Update the entries table
      const monthYearKey = `${editableData.year}-${String(
        editableData.month
      ).padStart(2, "0")}-01`;

      const { error } = await supabase.from("entries").upsert({
        hospital_id: hospitalId,
        month_year: monthYearKey,
        kwh_usage: editableData.kwh_usage,
        water_usage_m3: editableData.water_usage_m3,
        type1: editableData.waste_type1,
        type2: editableData.waste_type2,
        type3: editableData.waste_type3,
        type4: editableData.waste_type4,
        co2_emissions: editableData.co2_emissions,
        fuel_type: editableData.fuel_type,
        kilometers_travelled: editableData.kilometers_travelled,
        license_plate: editableData.license_plate,
        renewable_energy_created: editableData.renewable_energy_created,
        submitted: editableData.submitted,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update local state
      setReportData(editableData);
      setIsEditing(false);
      setEditableData(null);

      // Show success message
      alert("Report updated successfully!");
    } catch (err: any) {
      console.error("Error updating report:", err);
      alert("Error updating report: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ReportData, value: number) => {
    if (editableData) {
      setEditableData({
        ...editableData,
        [field]: value,
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#225384] mx-auto"></div>
        <p className="text-gray-500 mt-2">
          {authLoading ? "Checking authentication..." : "Loading report..."}
        </p>
        {authLoading && (
          <p className="text-sm text-gray-400 mt-1">
            Please wait while we verify your session...
          </p>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please log in to access this page. If you were already logged in,
            your session may have expired.
          </AlertDescription>
        </Alert>
        <div className="mt-4 space-x-2">
          <Button variant="outline" onClick={() => router.push("/login")}>
            Go to Login
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert>
          <AlertDescription>No report data available</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {reportData.hospital_name} - Sustainability Report
            </h1>
            <p className="text-gray-600 mt-2">
              {new Date(
                reportData.year,
                reportData.month - 1
              ).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex space-x-2">
            <Badge variant={reportData.submitted ? "default" : "secondary"}>
              {reportData.submitted ? "Submitted" : "Pending"}
            </Badge>
            {!isEditing ? (
              <>
                <Button
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Report
                </Button>
                <Button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Submission Status */}
        {reportData.submitted_at && (
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              Report submitted on{" "}
              {new Date(reportData.submitted_at).toLocaleString()}
            </AlertDescription>
          </Alert>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Electricity Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Electricity Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing && editableData ? (
                <div className="space-y-2">
                  <Label htmlFor="kwh_usage">kWh</Label>
                  <Input
                    id="kwh_usage"
                    type="number"
                    value={editableData.kwh_usage}
                    onChange={(e) =>
                      handleInputChange(
                        "kwh_usage",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="text-lg"
                  />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-blue-600">
                    {reportData.kwh_usage.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">kWh</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Water Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-500" />
                Water Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing && editableData ? (
                <div className="space-y-2">
                  <Label htmlFor="water_usage_m3">m³</Label>
                  <Input
                    id="water_usage_m3"
                    type="number"
                    value={editableData.water_usage_m3}
                    onChange={(e) =>
                      handleInputChange(
                        "water_usage_m3",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="text-lg"
                  />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-blue-500">
                    {reportData.water_usage_m3.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">m³</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* CO2 Emissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-600" />
                CO₂ Emissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing && editableData ? (
                <div className="space-y-2">
                  <Label htmlFor="co2_emissions">kg CO₂e</Label>
                  <Input
                    id="co2_emissions"
                    type="number"
                    value={editableData.co2_emissions}
                    onChange={(e) =>
                      handleInputChange(
                        "co2_emissions",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="text-lg"
                  />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-orange-600">
                    {reportData.co2_emissions.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">kg CO₂e</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Waste Type 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Type 1 Waste</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing && editableData ? (
                <div className="space-y-2">
                  <Label htmlFor="waste_type1">kg</Label>
                  <Input
                    id="waste_type1"
                    type="number"
                    value={editableData.waste_type1}
                    onChange={(e) =>
                      handleInputChange(
                        "waste_type1",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="text-lg"
                  />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-red-600">
                    {reportData.waste_type1.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">kg</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Waste Type 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600">Type 2 Waste</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing && editableData ? (
                <div className="space-y-2">
                  <Label htmlFor="waste_type2">kg</Label>
                  <Input
                    id="waste_type2"
                    type="number"
                    value={editableData.waste_type2}
                    onChange={(e) =>
                      handleInputChange(
                        "waste_type2",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="text-lg"
                  />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-purple-600">
                    {reportData.waste_type2.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">kg</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Waste Type 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-600">Type 3 Waste</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing && editableData ? (
                <div className="space-y-2">
                  <Label htmlFor="waste_type3">kg</Label>
                  <Input
                    id="waste_type3"
                    type="number"
                    value={editableData.waste_type3}
                    onChange={(e) =>
                      handleInputChange(
                        "waste_type3",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="text-lg"
                  />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-yellow-600">
                    {reportData.waste_type3.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">kg</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Waste Type 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-pink-600">Type 4 Waste</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing && editableData ? (
                <div className="space-y-2">
                  <Label htmlFor="waste_type4">kg</Label>
                  <Input
                    id="waste_type4"
                    type="number"
                    value={editableData.waste_type4}
                    onChange={(e) =>
                      handleInputChange(
                        "waste_type4",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="text-lg"
                  />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-pink-600">
                    {reportData.waste_type4.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">kg</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Fuel Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-indigo-600">Fuel Type</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing && editableData ? (
                <div className="space-y-2">
                  <Label htmlFor="fuel_type">Fuel Type</Label>
                  <select
                    id="fuel_type"
                    value={editableData.fuel_type || ""}
                    onChange={(e) =>
                      setEditableData({
                        ...editableData,
                        fuel_type: e.target.value || null,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select fuel type</option>
                    <option value="gas">Gas</option>
                    <option value="diesel">Diesel</option>
                  </select>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-indigo-600">
                    {reportData.fuel_type || "Not specified"}
                  </div>
                  <p className="text-sm text-gray-500">Vehicle fuel type</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Kilometers Travelled */}
          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-600">Kilometers Travelled</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing && editableData ? (
                <div className="space-y-2">
                  <Label htmlFor="kilometers_travelled">km</Label>
                  <Input
                    id="kilometers_travelled"
                    type="number"
                    value={editableData.kilometers_travelled || 0}
                    onChange={(e) =>
                      handleInputChange(
                        "kilometers_travelled",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="text-lg"
                  />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-emerald-600">
                    {(reportData.kilometers_travelled || 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">km</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* License Plate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-cyan-600">License Plate</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing && editableData ? (
                <div className="space-y-2">
                  <Label htmlFor="license_plate">License Plate</Label>
                  <Input
                    id="license_plate"
                    type="text"
                    value={editableData.license_plate || ""}
                    onChange={(e) =>
                      setEditableData({
                        ...editableData,
                        license_plate: e.target.value || null,
                      })
                    }
                    className="text-lg"
                    placeholder="Enter license plate"
                  />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-cyan-600">
                    {reportData.license_plate || "Not specified"}
                  </div>
                  <p className="text-sm text-gray-500">Vehicle license plate</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Renewable Energy Created */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Renewable Energy Created</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing && editableData ? (
                <div className="space-y-2">
                  <Label htmlFor="renewable_energy_created">kWh</Label>
                  <Input
                    id="renewable_energy_created"
                    type="number"
                    value={editableData.renewable_energy_created || 0}
                    onChange={(e) =>
                      handleInputChange(
                        "renewable_energy_created",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="text-lg"
                  />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-green-600">
                    {(reportData.renewable_energy_created || 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">kWh</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p>
                  <strong>Hospital:</strong> {reportData.hospital_name}
                </p>
                <p>
                  <strong>Period:</strong>{" "}
                  {new Date(
                    reportData.year,
                    reportData.month - 1
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p>
                  <strong>Total Energy:</strong>{" "}
                  {reportData.kwh_usage.toLocaleString()} kWh
                </p>
                <p>
                  <strong>Total Water:</strong>{" "}
                  {reportData.water_usage_m3.toLocaleString()} m³
                </p>
              </div>
              <div>
                <p>
                  <strong>Total Waste:</strong>{" "}
                  {(
                    reportData.waste_type1 +
                    reportData.waste_type2 +
                    reportData.waste_type3 +
                    reportData.waste_type4
                  ).toLocaleString()}{" "}
                  kg
                </p>
                <p>
                  <strong>CO₂ Emissions:</strong>{" "}
                  {reportData.co2_emissions.toLocaleString()} kg CO₂e
                </p>
                <p>
                  <strong>Fuel Type:</strong>{" "}
                  {reportData.fuel_type || "Not specified"}
                </p>
                <p>
                  <strong>Kilometers Travelled:</strong>{" "}
                  {(reportData.kilometers_travelled || 0).toLocaleString()} km
                </p>
              </div>
              <div>
                <p>
                  <strong>License Plate:</strong>{" "}
                  {reportData.license_plate || "Not specified"}
                </p>
                <p>
                  <strong>Renewable Energy Created:</strong>{" "}
                  {(reportData.renewable_energy_created || 0).toLocaleString()} kWh
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {reportData.submitted ? "Submitted" : "Pending"}
                </p>
                <p>
                  <strong>Last Updated:</strong>{" "}
                  {new Date(reportData.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
