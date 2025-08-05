"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyFormList } from "@/hooks/useFormList";
import { useMyEntries } from "@/hooks/useMyEntries";
import { useRouter } from "next/navigation";
import {
  FileText,
  Eye,
  Edit,
  Calendar,
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  Plus,
  Activity,
} from "lucide-react";
import { FormListEntry } from "@/types/forms";

// Sparkline component for trend visualization
const Sparkline = ({
  data,
  className = "",
}: {
  data: number[];
  className?: string;
}) => {
  if (!data || data.length === 0)
    return <div className="h-16 bg-gray-100 rounded"></div>;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={`h-16 ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={points}
          className="text-blue-500"
        />
      </svg>
    </div>
  );
};

export default function DepartmentDataEntry() {
  const {
    forms,
    loading: formsLoading,
    error: formsError,
    refresh: refreshForms,
  } = useMyFormList();
  const {
    data: entriesData,
    loading: entriesLoading,
    error: entriesError,
    refresh: refreshEntries,
    exportToCSV,
  } = useMyEntries();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("data-entry");

  const loading = formsLoading || entriesLoading;
  const error = formsError || entriesError;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading data: {error}</p>
              <Button
                onClick={() => {
                  refreshForms();
                  refreshEntries();
                }}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentMonthName = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Prepare sparkline data for reports
  const sparklineData =
    entriesData?.historical_entries?.map((entry) => entry.kwh_usage) || [];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Data Entry & Reports
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your monthly sustainability data and view reports
        </p>
      </div>

      {/* Tabs for Data Entry and Reports */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="data-entry"
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Data Entry</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Reports & Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Data Entry Tab */}
        <TabsContent value="data-entry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Monthly Sustainability Forms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form: FormListEntry) => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{form.form_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={form.submitted ? "secondary" : "default"}
                          className={
                            form.submitted
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {form.submitted ? "Submitted" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {form.submitted_at ? (
                          new Date(form.submitted_at).toLocaleDateString()
                        ) : (
                          <span className="text-gray-500">Not submitted</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/department/data-entry/${form.id}`)
                            }
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/department/data-entry/${form.id}`)
                            }
                            className="flex items-center space-x-1"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Energy Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>12-Month Energy Trend</CardTitle>
              <CardContent className="pt-0">
                Your hospital's energy usage over the past year
              </CardContent>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Sparkline data={sparklineData} />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-500">Current</div>
                    <div className="text-lg font-semibold">
                      {entriesData?.current_month_entry?.kwh_usage.toLocaleString() ||
                        "0"}{" "}
                      kWh
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Average</div>
                    <div className="text-lg font-semibold">
                      {Math.round(
                        sparklineData.reduce((a, b) => a + b, 0) /
                          sparklineData.length || 0
                      ).toLocaleString()}{" "}
                      kWh
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Peak</div>
                    <div className="text-lg font-semibold">
                      {Math.max(...sparklineData, 0).toLocaleString()} kWh
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Monthly Report</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant="default">Completed</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Period</span>
                    <span className="text-sm">{currentMonthName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Submitted</span>
                    <span className="text-sm">
                      {entriesData?.submission_status?.submitted_at
                        ? new Date(
                            entriesData.submission_status.submitted_at
                          ).toLocaleDateString()
                        : "Not submitted"}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Trend Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Energy Trend</span>
                    <div className="flex items-center text-green-600">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span className="text-sm">-12%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Water Trend</span>
                    <div className="flex items-center text-green-600">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span className="text-sm">-8%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Waste Trend</span>
                    <div className="flex items-center text-red-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="text-sm">+5%</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Next Report</span>
                    <Badge variant="secondary">Due Soon</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Due Date</span>
                    <span className="text-sm">Feb 15, 2024</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Days Left</span>
                    <span className="text-sm text-orange-600 font-medium">
                      12
                    </span>
                  </div>
                  <Button size="sm" className="w-full">
                    Start Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Data */}
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardContent className="pt-0">
                Export your historical data for analysis
              </CardContent>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={refreshEntries}
                  className="flex items-center space-x-2"
                >
                  <Activity className="h-4 w-4" />
                  <span>Refresh Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
