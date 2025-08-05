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
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { supabase } from "@/lib/supabaseClient";
import { assignHospitalToUser } from "@/lib/utils";
import { useAllDepartments } from "@/hooks/useAllDepartments";

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

      {/* Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>15 Days Left Until Monthly Report Due</span>
          <Button variant="outline" size="sm">
            Notify Team
          </Button>
        </AlertDescription>
      </Alert>

      {/* Department Heads Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Department Heads - Submission Status & Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {departmentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#225384] mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading department heads...</p>
            </div>
          ) : departmentData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No department heads found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Department Head</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Submission Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentData.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell className="font-medium">
                      {hospital.name}
                    </TableCell>
                    <TableCell>
                      {hospital.department_head?.name || "Not assigned"}
                    </TableCell>
                    <TableCell>
                      {hospital.department_head?.email || "N/A"}
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
                        {hospital.department_head?.email && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleSendReminder(hospital.department_head.email)
                            }
                            disabled={
                              sendingReminder === hospital.department_head.email
                            }
                            className="flex items-center space-x-1"
                          >
                            {sendingReminder ===
                            hospital.department_head.email ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <Mail className="h-3 w-3" />
                                <span>Send Reminder</span>
                              </>
                            )}
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
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
            User Management - Hospital Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#225384] mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                All users have been assigned to hospitals!
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
                            <SelectValue placeholder="Select hospital" />
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

      {/* Cumulative Metrics - All 7 Required Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>
            Cumulative Metrics - 7 Key Sustainability Indicators
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
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading metrics data...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Hospitals Trends */}
      <Card>
        <CardHeader>
          <CardTitle>All Hospitals Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Multi-line chart placeholder</p>
          </div>
        </CardContent>
      </Card>

      {/* Sparkline Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={i % 2 === 0 ? "default" : "secondary"}>
                  Hospital {i + 1}
                </Badge>
                <span className="text-xs text-gray-500">
                  +{Math.floor(Math.random() * 20)}%
                </span>
              </div>
              <div className="h-16 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-xs text-gray-500">Sparkline</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
