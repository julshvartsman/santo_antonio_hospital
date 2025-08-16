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
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/components/providers/AppProvider";
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
  const { user } = useAuth();
  const { language } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("data-entry");

  // Function to download monthly report as CSV
  const downloadMonthlyReport = () => {
    if (!entriesData?.current_month_entry) {
      alert("No current month data available for download");
      return;
    }

    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    const csvData = [
      ["Monthly Sustainability Report", currentMonth],
      [""],
      ["Metric", "Value", "Unit"],
      [language.t("metrics.energyUsageKwh"), entriesData.current_month_entry.kwh_usage || 0, "kWh"],
      [
        "Water Usage",
        entriesData.current_month_entry.water_usage_m3 || 0,
        "m³",
      ],
      ["Type 1 Waste", entriesData.current_month_entry.type1 || 0, "kg"],
      ["Type 2 Waste", entriesData.current_month_entry.type2 || 0, "kg"],
      ["Type 3 Waste", entriesData.current_month_entry.type3 || 0, "kg"],
      ["Type 4 Waste", entriesData.current_month_entry.type4 || 0, "kg"],
      [
        "CO₂ Emissions",
        entriesData.current_month_entry.co2_emissions || 0,
        "kg CO₂e",
      ],
      [
              language.t("metrics.kilometersGasKm"),
      entriesData.current_month_entry.km_travelled_gas || 0,
      "km",
    ],
    [
      language.t("metrics.kilometersDieselKm"),
      entriesData.current_month_entry.km_travelled_diesel || 0,
      "km",
    ],
    [
      language.t("metrics.kilometersGasolineKm"),
      entriesData.current_month_entry.km_travelled_gasoline || 0,
      "km",
    ],
    [
      language.t("metrics.licensePlate"),
      entriesData.current_month_entry.license_plate || "N/A",
      "",
    ],
    [
      language.t("metrics.renewableEnergyCreatedKwh"),
      entriesData.current_month_entry.renewable_energy_created || 0,
      "kWh",
    ],
      [""],
      ["Report Generated", new Date().toLocaleDateString()],
      ["Submitted", entriesData.current_month_entry.submitted ? "Yes" : "No"],
      [
        "Submitted Date",
        entriesData.current_month_entry.submitted_at
          ? new Date(
              entriesData.current_month_entry.submitted_at
            ).toLocaleDateString()
          : "Not submitted",
      ],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sustainability-report-${currentMonth.replace(" ", "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Function to view trend analysis details
  const viewTrendAnalysis = () => {
    // Navigate to a detailed trend analysis page or show modal
    alert(
      "Trend Analysis Details:\n\n" +
        "Energy Trend: -12% (Improving)\n" +
        "Water Trend: -8% (Improving)\n" +
        "CO₂ Trend: -15% (Improving)\n" +
        "Waste Trend: +5% (Needs attention)\n\n" +
        "This feature will show detailed trend analysis with charts and recommendations."
    );
  };

  // Function to view CO2 emissions details
  const viewCO2Details = () => {
    if (!entriesData?.historical_entries) {
      alert("No CO₂ emissions data available");
      return;
    }

    const co2Data = entriesData.historical_entries.map(
      (entry) => entry.co2_emissions || 0
    );
    const average = co2Data.reduce((a, b) => a + b, 0) / co2Data.length;
    const total = co2Data.reduce((a, b) => a + b, 0);
    const peak = Math.max(...co2Data);
    const current = entriesData.current_month_entry?.co2_emissions || 0;

    alert(
      "CO₂ Emissions Detailed Analysis:\n\n" +
        `Current Month: ${current.toLocaleString()} kg CO₂e\n` +
        `Monthly Average: ${Math.round(average).toLocaleString()} kg CO₂e\n` +
        `Peak Month: ${peak.toLocaleString()} kg CO₂e\n` +
        `Year Total: ${total.toLocaleString()} kg CO₂e\n\n` +
        "This feature will show detailed CO₂ analysis with breakdowns by source and recommendations for reduction."
    );
  };

  const loading = formsLoading || entriesLoading;
  const error = formsError || entriesError;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language.t("common.loadingData")}</p>
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
                {language.t("common.tryAgain")}
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
          {language.t("dept.dataEntry.title")}
        </h1>
        <p className="text-gray-600 mt-2">
          {language.t("dept.dataEntry.subtitle")}
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
            <span>{language.t("dept.dataEntry.tab.entry")}</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>{language.t("dept.dataEntry.tab.reports")}</span>
          </TabsTrigger>
        </TabsList>

        {/* Data Entry Tab */}
        <TabsContent value="data-entry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>{language.t("dept.dataEntry.title")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {language.t("dept.dataEntry.table.formName")}
                    </TableHead>
                    <TableHead>
                      {language.t("dept.dataEntry.table.status")}
                    </TableHead>
                    <TableHead>
                      {language.t("dept.dataEntry.table.submittedDate")}
                    </TableHead>
                    <TableHead className="text-right">
                      {language.t("dept.dataEntry.table.actions")}
                    </TableHead>
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
                          {form.submitted
                            ? language.t("dept.dataEntry.status.submitted")
                            : language.t("dept.dataEntry.status.draft")}
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
              <CardTitle>{language.t("metrics.energyTrendTitle")}</CardTitle>
              <CardContent className="pt-0">
                {language.t("metrics.energyTrendDescription")}
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

          {/* CO2 Emissions Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>12-Month CO₂ Emissions Trend</CardTitle>
              <CardContent className="pt-0">
                Your hospital's CO₂ emissions over the past year
              </CardContent>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Sparkline
                  data={
                    entriesData?.historical_entries?.map(
                      (entry) => entry.co2_emissions || 0
                    ) || []
                  }
                />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-500">Current</div>
                    <div className="text-lg font-semibold">
                      {entriesData?.current_month_entry?.co2_emissions?.toLocaleString() ||
                        "0"}{" "}
                      kg CO₂e
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Average</div>
                    <div className="text-lg font-semibold">
                      {Math.round(
                        (
                          entriesData?.historical_entries?.map(
                            (entry) => entry.co2_emissions || 0
                          ) || []
                        ).reduce((a, b) => a + b, 0) /
                          (entriesData?.historical_entries?.length || 1)
                      ).toLocaleString()}{" "}
                      kg CO₂e
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Peak</div>
                    <div className="text-lg font-semibold">
                      {Math.max(
                        ...(entriesData?.historical_entries?.map(
                          (entry) => entry.co2_emissions || 0
                        ) || []),
                        0
                      ).toLocaleString()}{" "}
                      kg CO₂e
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={downloadMonthlyReport}
                  >
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
                    <span className="text-sm text-gray-600">{language.t("metrics.energyTrend")}</span>
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
                    <span className="text-sm text-gray-600">CO₂ Trend</span>
                    <div className="flex items-center text-green-600">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span className="text-sm">-15%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Waste Trend</span>
                    <div className="flex items-center text-red-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="text-sm">+5%</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={viewTrendAnalysis}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>CO₂ Emissions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Month</span>
                    <span className="text-sm font-medium">
                      {entriesData?.current_month_entry?.co2_emissions?.toLocaleString() ||
                        "0"}{" "}
                      kg CO₂e
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Monthly Average
                    </span>
                    <span className="text-sm font-medium">
                      {Math.round(
                        (
                          entriesData?.historical_entries?.map(
                            (entry) => entry.co2_emissions || 0
                          ) || []
                        ).reduce((a, b) => a + b, 0) /
                          (entriesData?.historical_entries?.length || 1)
                      ).toLocaleString()}{" "}
                      kg CO₂e
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Year Total</span>
                    <span className="text-sm font-medium">
                      {(
                        entriesData?.historical_entries?.map(
                          (entry) => entry.co2_emissions || 0
                        ) || []
                      )
                        .reduce((a, b) => a + b, 0)
                        .toLocaleString()}{" "}
                      kg CO₂e
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={viewCO2Details}
                  >
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
                    <span className="text-sm">
                      {(() => {
                        const now = new Date();
                        const nextMonth = new Date(
                          now.getFullYear(),
                          now.getMonth() + 1,
                          15
                        );
                        return nextMonth.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Days Left</span>
                    <span className="text-sm text-orange-600 font-medium">
                      {(() => {
                        const now = new Date();
                        const nextMonth = new Date(
                          now.getFullYear(),
                          now.getMonth() + 1,
                          15
                        );
                        const daysLeft = Math.ceil(
                          (nextMonth.getTime() - now.getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        return daysLeft;
                      })()}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const now = new Date();
                      const nextMonth = new Date(
                        now.getFullYear(),
                        now.getMonth() + 1,
                        1
                      );
                      const formId = `${user?.hospital_id}-${(
                        nextMonth.getMonth() + 1
                      )
                        .toString()
                        .padStart(2, "0")}-${nextMonth.getFullYear()}`;
                      router.push(`/department/data-entry/${formId}`);
                    }}
                  >
                    Start Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
