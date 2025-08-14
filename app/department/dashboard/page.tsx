"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMyEntries } from "@/hooks/useMyEntries";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/components/providers/AppProvider";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Activity,
  ArrowRight,
  FileText,
} from "lucide-react";

// Badge component
const Badge = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}) => {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Sparkline component
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

export default function DepartmentDashboard() {
  const { data, loading, error, refresh, exportToCSV } = useMyEntries();
  const { user } = useAuth();
  const { language } = useApp();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#225384] mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language.t("common.loadingDashboard")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {language.t("common.loadingData")} {error}
          </AlertDescription>
        </Alert>
        <Button onClick={refresh} className="mt-4">
          {language.t("common.tryAgain")}
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const currentMonthName = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Prepare sparkline data
  const sparklineData = data.historical_entries.map((entry) => entry.kwh_usage);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {language.t("dashboard.department")}
        </h1>
        <p className="text-gray-600 mt-2">{language.t("dashboard.metrics")}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6">
        {/* Data Entry Card */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 text-blue-600 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-900">
                {language.t("dept.dashboard.dataEntryReports")}
              </h2>
              <p className="text-gray-600">
                {language.t("dept.dashboard.enterMonthly")}
              </p>
              <Button
                size="lg"
                onClick={() => router.push("/department/data-entry")}
                className="flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ArrowRight className="h-5 w-5" />
                <span>{language.t("buttons.goToDataEntry")}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submission Status Banner */}
      <div>
        {data.submission_status.submitted ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>{language.t("dept.dashboard.metricsSubmitted")}</strong>
              {" - "}
              {language.t("dept.dashboard.enterMonthly")} {currentMonthName}{" "}
              {data.submission_status.submitted_at &&
                new Date(
                  data.submission_status.submitted_at
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>{language.t("dept.dashboard.submissionPending")}</strong>
              {" - "}
              {language.t("dept.dashboard.enterMonthly")} {currentMonthName}{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-yellow-800 underline"
                onClick={() => router.push("/department/data-entry")}
              >
                {language.t("dept.dashboard.submitNow")}
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Energy Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{language.t("dept.dashboard.energyTrendTitle")}</CardTitle>
          <CardDescription>
            {language.t("dept.dashboard.energyTrendDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Sparkline data={sparklineData} />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">
                  {language.t("common.current")}
                </div>
                <div className="text-lg font-semibold">
                  {data.current_month_entry?.kwh_usage.toLocaleString() || "0"}{" "}
                  kWh
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {language.t("common.average")}
                </div>
                <div className="text-lg font-semibold">
                  {Math.round(
                    sparklineData.reduce((a, b) => a + b, 0) /
                      sparklineData.length || 0
                  ).toLocaleString()}{" "}
                  kWh
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {language.t("common.peak")}
                </div>
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
          <CardTitle>CO₂ Emissions Trend</CardTitle>
          <CardDescription>
            Your hospital's CO₂ emissions over the past year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Sparkline data={data.historical_entries.map((entry) => entry.co2_emissions || 0)} />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">
                  {language.t("common.current")}
                </div>
                <div className="text-lg font-semibold">
                  {data.current_month_entry?.co2_emissions?.toLocaleString() || "0"}{" "}
                  kg CO₂e
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {language.t("common.average")}
                </div>
                <div className="text-lg font-semibold">
                  {Math.round(
                    data.historical_entries
                      .map((entry) => entry.co2_emissions || 0)
                      .reduce((a, b) => a + b, 0) /
                      data.historical_entries.length || 0
                  ).toLocaleString()}{" "}
                  kg CO₂e
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {language.t("common.peak")}
                </div>
                <div className="text-lg font-semibold">
                  {Math.max(...data.historical_entries.map((entry) => entry.co2_emissions || 0), 0).toLocaleString()}{" "}
                  kg CO₂e
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              {language.t("dept.dashboard.totalEntries")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.historical_entries.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {language.t("dept.dashboard.entriesSubtitle")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              {language.t("dept.dashboard.avgEnergy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                sparklineData.reduce((a, b) => a + b, 0) /
                  sparklineData.length || 0
              ).toLocaleString()}{" "}
              kWh
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {language.t("dept.dashboard.monthlyAverage")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              CO₂ Emissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.current_month_entry?.co2_emissions?.toLocaleString() || "0"}{" "}
              kg CO₂e
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current month emissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              {language.t("dept.dashboard.lastUpdated")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.current_month_entry?.updated_at
                ? new Date(
                    data.current_month_entry.updated_at
                  ).toLocaleDateString()
                : language.t("common.never")}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {language.t("dept.dashboard.lastDataEntry")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
