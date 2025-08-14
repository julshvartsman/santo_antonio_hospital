"use client";

import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Mail,
  Clock,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { supabase } from "@/lib/supabaseClient";
import { assignHospitalToUser } from "@/lib/utils";
import { useAllDepartments } from "@/hooks/useAllDepartments";
import { useForms } from "@/hooks/useForms";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  hospital_id: string | null;
  created_at: string;
}

interface Hospital {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const { language } = useApp();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [reminderStatus, setReminderStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Use the existing hook for department data
  const {
    hospitals: departmentData,
    cumulativeMetrics,
    loading: departmentsLoading,
  } = useAllDepartments();

  // Use the new hook for forms data
  const {
    forms: formsData,
    loading: formsLoading,
    error: formsError,
    refresh: refreshForms,
  } = useForms();

  useEffect(() => {
    fetchUsersAndHospitals();
  }, []);

  const fetchUsersAndHospitals = async () => {
    try {
      setLoading(true);

      // Fetch users without hospital_id
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .is("hospital_id", null)
        .order("created_at", { ascending: false });

      if (usersError) {
        console.error("Error fetching users:", usersError);
        return;
      }

      // Fetch all hospitals
      const { data: hospitalsData, error: hospitalsError } = await supabase
        .from("hospitals")
        .select("*")
        .order("name");

      if (hospitalsError) {
        console.error("Error fetching hospitals:", hospitalsError);
        return;
      }

      setUsers(usersData || []);
      setHospitals(hospitalsData || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignHospital = async (userId: string, hospitalName: string) => {
    try {
      setAssigning(userId);
      const success = await assignHospitalToUser(userId, hospitalName);

      if (success) {
        // Refresh the users list
        await fetchUsersAndHospitals();
      }
    } catch (error) {
      console.error("Error assigning hospital:", error);
    } finally {
      setAssigning(null);
    }
  };

  const handleSendReminder = async (departmentHeadEmail: string) => {
    try {
      setSendingReminder(departmentHeadEmail);
      setReminderStatus({ type: null, message: "" });

      const response = await fetch("/api/send-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departmentHeadEmail,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setReminderStatus({
          type: "success",
          message: `Reminder sent successfully to ${result.departmentHead.name}`,
        });
      } else {
        setReminderStatus({
          type: "error",
          message: result.error || "Failed to send reminder",
        });
      }
    } catch (error) {
      setReminderStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setSendingReminder(null);
      // Clear status after 3 seconds
      setTimeout(() => {
        setReminderStatus({ type: null, message: "" });
      }, 3000);
    }
  };

  const getSubmissionStatusBadge = (
    submitted: boolean,
    submittedAt?: string
  ) => {
    if (submitted) {
      return <Badge className="bg-green-100 text-green-800">Submitted</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Pending</Badge>;
    }
  };

  const getSubmissionStatusIcon = (submitted: boolean) => {
    if (submitted) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <Clock className="h-4 w-4 text-red-500" />;
    }
  };

  const openWhatsApp = (phone: string, hospitalName: string) => {
    if (!phone) return;
    const digits = phone.replace(/\D/g, "");
    const now = new Date();
    const monthName = now.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    const appUrl = typeof window !== "undefined" ? window.location.origin : "";
    const text = `Reminder: Please submit your monthly sustainability data for ${hospitalName} (${monthName}). ${appUrl}`;
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {language.t("dashboard.admin")}
        </h1>
        <p className="text-gray-600 mt-2">{language.t("dashboard.manage")}</p>
      </div>

      {/* Reminder Status Alert */}
      {reminderStatus.type && (
        <Alert
          className={
            reminderStatus.type === "success"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }
        >
          {reminderStatus.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription
            className={
              reminderStatus.type === "success"
                ? "text-green-800"
                : "text-red-800"
            }
          >
            {reminderStatus.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Department Heads Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {language.t("admin.dashboard.deptSectionTitle")}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            {language.t("admin.dashboard.deptSectionHelp")}
          </p>
        </CardHeader>
        <CardContent>
          {departmentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#225384] mx-auto"></div>
              <p className="text-gray-500 mt-2">
                {language.t("admin.common.loadingDepartments")}
              </p>
            </div>
          ) : departmentData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {language.t("admin.common.noDepartments")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {language.t("admin.forms.table.hospital")}
                  </TableHead>
                  <TableHead>
                    {language.t("admin.forms.table.deptHead")}
                  </TableHead>
                  <TableHead>{language.t("admin.users.table.email")}</TableHead>
                  <TableHead>
                    {language.t("admin.forms.table.status")}
                  </TableHead>
                  <TableHead>
                    {language.t("dept.dashboard.lastUpdated")}
                  </TableHead>
                  <TableHead>
                    {language.t("admin.dashboard.sendReminder")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentData.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell className="font-medium">
                      {hospital.name}
                    </TableCell>
                    <TableCell>
                      {hospital.department_head?.name ||
                        language.t("admin.common.notAssigned")}
                    </TableCell>
                    <TableCell>
                      {hospital.department_head?.email ||
                        language.t("admin.common.na")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getSubmissionStatusIcon(
                          hospital.submission_status.submitted
                        )}
                        {getSubmissionStatusBadge(
                          hospital.submission_status.submitted,
                          hospital.submission_status.submitted_at
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {hospital.latest_entry?.updated_at ? (
                        new Date(
                          hospital.latest_entry.updated_at
                        ).toLocaleDateString()
                      ) : (
                        <span className="text-gray-500">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {hospital.department_head?.email ? (
                          <Button
                            variant={
                              hospital.submission_status.submitted
                                ? "outline"
                                : "default"
                            }
                            size="sm"
                            onClick={() =>
                              handleSendReminder(hospital.department_head.email)
                            }
                            disabled={
                              sendingReminder ===
                                hospital.department_head.email ||
                              hospital.submission_status.submitted
                            }
                            className={`flex items-center space-x-1 ${
                              hospital.submission_status.submitted
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-blue-600"
                            }`}
                          >
                            {sendingReminder ===
                            hospital.department_head.email ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                <span>Sending...</span>
                              </>
                            ) : hospital.submission_status.submitted ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                <span>
                                  {language.t("admin.dashboard.submitted")}
                                </span>
                              </>
                            ) : (
                              <>
                                <Mail className="h-3 w-3" />
                                <span>
                                  {language.t("admin.dashboard.sendReminder")}
                                </span>
                              </>
                            )}
                          </Button>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {language.t("admin.common.notAssigned")}
                          </div>
                        )}
                        {hospital.department_head?.phone &&
                          !hospital.submission_status.submitted && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openWhatsApp(
                                  hospital.department_head!.phone as string,
                                  hospital.name
                                )
                              }
                              className="flex items-center space-x-1"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>WhatsApp</span>
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {language.t("admin.users.sectionTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#225384] mx-auto"></div>
              <p className="text-gray-500 mt-2">
                {language.t("admin.users.loading")}
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {language.t("admin.users.allAssigned")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Assign Hospital</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          onValueChange={(value) =>
                            handleAssignHospital(user.id, value)
                          }
                          disabled={assigning === user.id}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue
                              placeholder={language.t(
                                "admin.users.table.assignHospital"
                              )}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {hospitals.map((hospital) => (
                              <SelectItem
                                key={hospital.id}
                                value={hospital.name}
                              >
                                {hospital.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {assigning === user.id && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#225384]"></div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Cumulative Metrics - 11 Key Sustainability Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>
            Cumulative Metrics - 11 Key Sustainability Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cumulativeMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Electricity Usage */}
              <div className="bg-[#225384]/10 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#225384]">Electricity Usage</p>
                    <p className="text-2xl font-bold text-[#225384]">
                      {cumulativeMetrics.total_kwh.toLocaleString()} kWh
                    </p>
                    <p className="text-xs text-[#225384]/70">
                      {cumulativeMetrics.overall_changes.kwh > 0 ? "+" : ""}
                      {cumulativeMetrics.overall_changes.kwh.toFixed(1)}% vs
                      last month
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-[#225384]" />
                </div>
              </div>

              {/* Water Usage */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Water Usage</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {cumulativeMetrics.total_water_m3.toLocaleString()} m³
                    </p>
                    <p className="text-xs text-blue-600/70">
                      {cumulativeMetrics.overall_changes.water > 0 ? "+" : ""}
                      {cumulativeMetrics.overall_changes.water.toFixed(1)}% vs
                      last month
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              {/* Type 1 Waste */}
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Type 1 Waste</p>
                    <p className="text-2xl font-bold text-red-900">
                      {cumulativeMetrics.total_waste_type1.toLocaleString()} kg
                    </p>
                    <p className="text-xs text-red-600/70">
                      {cumulativeMetrics.overall_changes.waste_type1 > 0
                        ? "+"
                        : ""}
                      {cumulativeMetrics.overall_changes.waste_type1.toFixed(1)}
                      % vs last month
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-red-600" />
                </div>
              </div>

              {/* Type 2 Waste */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600">Type 2 Waste</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {cumulativeMetrics.total_waste_type2.toLocaleString()} kg
                    </p>
                    <p className="text-xs text-purple-600/70">
                      {cumulativeMetrics.overall_changes.waste_type2 > 0
                        ? "+"
                        : ""}
                      {cumulativeMetrics.overall_changes.waste_type2.toFixed(1)}
                      % vs last month
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              {/* Type 3 Waste */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">Type 3 Waste</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {cumulativeMetrics.total_waste_type3.toLocaleString()} kg
                    </p>
                    <p className="text-xs text-yellow-600/70">
                      {cumulativeMetrics.overall_changes.waste_type3 > 0
                        ? "+"
                        : ""}
                      {cumulativeMetrics.overall_changes.waste_type3.toFixed(1)}
                      % vs last month
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              {/* Type 4 Waste */}
              <div className="bg-pink-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-pink-600">Type 4 Waste</p>
                    <p className="text-2xl font-bold text-pink-900">
                      {cumulativeMetrics.total_waste_type4.toLocaleString()} kg
                    </p>
                    <p className="text-xs text-pink-600/70">
                      {cumulativeMetrics.overall_changes.waste_type4 > 0
                        ? "+"
                        : ""}
                      {cumulativeMetrics.overall_changes.waste_type4.toFixed(1)}
                      % vs last month
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-pink-600" />
                </div>
              </div>

              {/* CO2 Emissions (Calculated) */}
              <div className="bg-orange-50 p-4 rounded-lg col-span-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">
                      CO₂ Emissions (Calculated)
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {cumulativeMetrics.total_co2.toLocaleString()} kg CO₂e
                    </p>
                    <p className="text-xs text-orange-600/70">
                      Calculated from electricity, water, and all waste types
                    </p>
                    <p className="text-xs text-orange-600/70">
                      {cumulativeMetrics.overall_changes.co2 > 0 ? "+" : ""}
                      {cumulativeMetrics.overall_changes.co2.toFixed(1)}% vs
                      last month
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              {/* Kilometers Travelled */}
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-600">
                      Kilometers Travelled
                    </p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {Math.round(
                        cumulativeMetrics.total_kilometers_travelled || 0
                      ).toLocaleString()}{" "}
                      km
                    </p>
                    <p className="text-xs text-emerald-600/70">
                      {cumulativeMetrics.overall_changes.kilometers > 0
                        ? "+"
                        : ""}
                      {cumulativeMetrics.overall_changes.kilometers.toFixed(1)}%
                      vs last month
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </div>

              {/* Renewable Energy Created */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">
                      Renewable Energy Created
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {Math.round(
                        cumulativeMetrics.total_renewable_energy_created || 0
                      ).toLocaleString()}{" "}
                      kWh
                    </p>
                    <p className="text-xs text-green-600/70">
                      {cumulativeMetrics.overall_changes.renewable_energy > 0
                        ? "+"
                        : ""}
                      {cumulativeMetrics.overall_changes.renewable_energy.toFixed(
                        1
                      )}
                      % vs last month
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>

              {/* Fuel Type Mix */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Fuel Type Mix</p>
                    <p className="text-2xl font-bold text-slate-900">
                      Gas: {cumulativeMetrics.total_gas_count} / Diesel:{" "}
                      {cumulativeMetrics.total_diesel_count}
                    </p>
                    <p className="text-xs text-slate-600/70">
                      Vehicle entries categorized by fuel type this month
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-slate-600" />
                </div>
              </div>

              {/* License Plates Recorded */}
              <div className="bg-zinc-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">
                      License Plates Recorded
                    </p>
                    <p className="text-2xl font-bold text-zinc-900">
                      {cumulativeMetrics.total_license_plate_count}
                    </p>
                    <p className="text-xs text-zinc-600/70">
                      Total entries with plate numbers this month
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-zinc-600" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading metrics data...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Forms Data - Admin View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            All Hospital Submissions - Forms Data
          </CardTitle>
          <p className="text-sm text-gray-600">
            View all form submissions from every hospital. Click "View Report"
            to see detailed metrics.
          </p>
        </CardHeader>
        <CardContent>
          {formsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#225384] mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading forms data...</p>
            </div>
          ) : formsError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Error loading forms data: {formsError}
              </AlertDescription>
            </Alert>
          ) : formsData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No forms data found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {language.t("admin.forms.totals")}: {formsData.length} |{" "}
                  {language.t("admin.forms.submitted")}:{" "}
                  {formsData.filter((f) => f.submitted).length} |{" "}
                  {language.t("admin.forms.pending")}:{" "}
                  {formsData.filter((f) => !f.submitted).length}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshForms}
                  className="flex items-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  {language.t("admin.forms.refresh")}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {language.t("admin.forms.table.hospital")}
                    </TableHead>
                    <TableHead>
                      {language.t("admin.forms.table.deptHead")}
                    </TableHead>
                    <TableHead>
                      {language.t("admin.forms.table.monthYear")}
                    </TableHead>
                    <TableHead>
                      {language.t("admin.forms.table.status")}
                    </TableHead>
                    <TableHead>
                      {language.t("admin.forms.table.submittedAt")}
                    </TableHead>
                    <TableHead>
                      {language.t("admin.forms.table.created")}
                    </TableHead>
                    <TableHead>
                      {language.t("admin.forms.table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formsData.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">
                        {form.hospital_name}
                      </TableCell>
                      <TableCell>
                        {form.department_head ? (
                          <div>
                            <div className="font-medium">
                              {form.department_head.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {form.department_head.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">
                            {language.t("admin.common.notAssigned")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(form.year, form.month - 1).toLocaleDateString(
                          language.language === "pt" ? "pt-PT" : "en-US",
                          {
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getSubmissionStatusIcon(form.submitted)}
                          {getSubmissionStatusBadge(
                            form.submitted,
                            form.submitted_at || undefined
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {form.submitted_at ? (
                          new Date(form.submitted_at).toLocaleDateString(
                            language.language === "pt" ? "pt-PT" : "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        ) : (
                          <span className="text-gray-500">
                            {language.t("common.notSubmitted")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(form.created_at).toLocaleDateString(
                          language.language === "pt" ? "pt-PT" : "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Navigate to a detailed report view
                              router.push(
                                `/admin/report/${form.hospital_id}/${
                                  form.year
                                }-${String(form.month).padStart(2, "0")}`
                              );
                            }}
                            className="flex items-center space-x-1"
                          >
                            <Activity className="h-3 w-3" />
                            <span>{language.t("admin.forms.viewReport")}</span>
                          </Button>
                          {form.department_head?.email && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleSendReminder(form.department_head!.email)
                              }
                              disabled={
                                sendingReminder === form.department_head!.email
                              }
                              className="flex items-center space-x-1"
                            >
                              {sendingReminder ===
                              form.department_head!.email ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                  <span>
                                    {language.t("admin.dashboard.sending")}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Mail className="h-3 w-3" />
                                  <span>
                                    {language.t("admin.dashboard.sendReminder")}
                                  </span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
