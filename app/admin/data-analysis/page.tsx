"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/components/providers/AppProvider";
import { useAllDepartments } from "@/hooks/useAllDepartments";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Filter,
  Calendar,
  Building,
} from "lucide-react";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    tension?: number;
  }[];
}

interface TimeSeriesData {
  month: string;
  kwh_usage: number;
  water_usage_m3: number;
  co2_emissions: number;
  total_waste: number;
}

export default function DataAnalysisPage() {
  const { language } = useApp();
  const { hospitals, cumulativeMetrics, loading } = useAllDepartments();
  const [selectedMetric, setSelectedMetric] = useState("kwh_usage");
  const [selectedHospital, setSelectedHospital] = useState("all");
  const [timeRange, setTimeRange] = useState("6");
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Fetch time series data for the last 6 months
  useEffect(() => {
    fetchTimeSeriesData();
  }, [timeRange]);

  const fetchTimeSeriesData = async () => {
    try {
      const months = parseInt(timeRange);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - months);

      const { data, error } = await supabase
        .from("entries")
        .select(
          `
          *,
          hospitals!hospital_id (name)
        `
        )
        .gte("month_year", startDate.toISOString().slice(0, 7) + "-01")
        .lte("month_year", endDate.toISOString().slice(0, 7) + "-01")
        .order("month_year", { ascending: true });

      if (error) throw error;

      // Process data by month
      const monthlyData = new Map<string, TimeSeriesData>();

      // Initialize all months in the range with zero values
      for (let i = 0; i < months; i++) {
        const date = new Date(endDate);
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
        const monthLabel = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

        monthlyData.set(monthKey, {
          month: monthLabel,
          kwh_usage: 0,
          water_usage_m3: 0,
          co2_emissions: 0,
          total_waste: 0,
        });
      }

      // Add actual data where it exists
      data?.forEach((entry) => {
        const monthKey = entry.month_year.slice(0, 7); // YYYY-MM

        if (monthlyData.has(monthKey)) {
          const monthData = monthlyData.get(monthKey)!;
          monthData.kwh_usage += entry.kwh_usage || 0;
          monthData.water_usage_m3 += entry.water_usage_m3 || 0;
          monthData.co2_emissions += entry.co2_emissions || 0;
          monthData.total_waste +=
            (entry.waste_type1 || 0) +
            (entry.waste_type2 || 0) +
            (entry.waste_type3 || 0) +
            (entry.waste_type4 || 0);
        }
      });

      // Convert to array and sort by month
      const sortedData = Array.from(monthlyData.values()).sort((a, b) => {
        const dateA = new Date(a.month + " 1, 2000");
        const dateB = new Date(b.month + " 1, 2000");
        return dateA.getTime() - dateB.getTime();
      });

      setTimeSeriesData(sortedData);
    } catch (error) {
      console.error("Error fetching time series data:", error);
      setTimeSeriesData([]);
    }
  };

  // Generate chart data based on selected metric
  useEffect(() => {
    if (timeSeriesData.length === 0) return;

    const metricConfig = {
      kwh_usage: {
        label: "Electricity Usage (kWh)",
        color: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      },
      water_usage_m3: {
        label: "Water Usage (m³)",
        color: "#06B6D4",
        backgroundColor: "rgba(6, 182, 212, 0.1)",
      },
      co2_emissions: {
        label: "CO₂ Emissions (kg CO₂e)",
        color: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
      },
      total_waste: {
        label: "Total Waste (kg)",
        color: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
      },
    };

    const config = metricConfig[selectedMetric as keyof typeof metricConfig];

    setChartData({
      labels: timeSeriesData.map((d) => d.month),
      datasets: [
        {
          label: config.label,
          data: timeSeriesData.map(
            (d) => d[selectedMetric as keyof TimeSeriesData] as number
          ),
          borderColor: config.color,
          backgroundColor: config.backgroundColor,
          tension: 0.4,
        },
      ],
    });
  }, [timeSeriesData, selectedMetric]);

  // Calculate summary metrics based on selected metric
  const getSummaryMetrics = () => {
    if (!cumulativeMetrics) return null;

    const metricUnitMap: Record<string, string> = {
      kwh_usage: "kWh",
      water_usage_m3: "m³",
      co2_emissions: "kg CO₂e",
      total_waste: "kg",
    };

    let currentTotal = 0;
    let previousTotal = 0;
    let peak = 0;
    const unit = metricUnitMap[selectedMetric] || "";

    switch (selectedMetric) {
      case "kwh_usage": {
        currentTotal = cumulativeMetrics.total_kwh;
        previousTotal = cumulativeMetrics.previous_total_kwh;
        peak = Math.max(
          0,
          ...hospitals.map((h) => h.current_month_totals.kwh_usage)
        );
        break;
      }
      case "water_usage_m3": {
        currentTotal = cumulativeMetrics.total_water_m3;
        previousTotal = cumulativeMetrics.previous_total_water_m3;
        peak = Math.max(
          0,
          ...hospitals.map((h) => h.current_month_totals.water_usage_m3)
        );
        break;
      }
      case "co2_emissions": {
        currentTotal = cumulativeMetrics.total_co2;
        previousTotal = cumulativeMetrics.previous_total_co2;
        peak = Math.max(
          0,
          ...hospitals.map((h) => h.current_month_totals.co2_emissions)
        );
        break;
      }
      case "total_waste": {
        currentTotal =
          (cumulativeMetrics.total_waste_type1 || 0) +
          (cumulativeMetrics.total_waste_type2 || 0) +
          (cumulativeMetrics.total_waste_type3 || 0) +
          (cumulativeMetrics.total_waste_type4 || 0);
        previousTotal =
          (cumulativeMetrics.previous_total_waste_type1 || 0) +
          (cumulativeMetrics.previous_total_waste_type2 || 0) +
          (cumulativeMetrics.previous_total_waste_type3 || 0) +
          (cumulativeMetrics.previous_total_waste_type4 || 0);
        peak = Math.max(
          0,
          ...hospitals.map(
            (h) =>
              (h.current_month_totals.waste_type1 || 0) +
              (h.current_month_totals.waste_type2 || 0) +
              (h.current_month_totals.waste_type3 || 0) +
              (h.current_month_totals.waste_type4 || 0)
          )
        );
        break;
      }
      default: {
        currentTotal = 0;
        previousTotal = 0;
        peak = 0;
      }
    }

    const change =
      previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    return {
      unit,
      totalUsage: currentTotal.toLocaleString(),
      averagePerHospital:
        hospitals.length > 0
          ? (currentTotal / hospitals.length).toLocaleString()
          : "0",
      peakUsage: peak.toLocaleString(),
      efficiencyScore: Math.max(0, 100 - Math.abs(change)).toFixed(0),
      change: change,
    };
  };

  const summaryMetrics = getSummaryMetrics();

  // Simple line chart component using SVG
  const LineChart = ({ data }: { data: ChartData }) => {
    if (!data || data.datasets.length === 0 || data.labels.length === 0) {
      return (
        <div className="text-center text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No data available for the selected time period</p>
        </div>
      );
    }

    const values = data.datasets[0].data;

    // Check if we have valid data
    if (values.length === 0 || values.every((v) => v === 0 || isNaN(v))) {
      return (
        <div className="text-center text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No data available for the selected time period</p>
        </div>
      );
    }

    const width = 600;
    const height = 300;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const maxValue = Math.max(...values.filter((v) => !isNaN(v)));
    const minValue = Math.min(...values.filter((v) => !isNaN(v)));

    // Handle case where all values are the same
    const range = maxValue - minValue;
    const effectiveRange = range === 0 ? 1 : range;

    const xScale = (index: number) => {
      if (values.length <= 1) return padding + chartWidth / 2;
      return padding + (index / (values.length - 1)) * chartWidth;
    };

    const yScale = (value: number) => {
      if (isNaN(value)) return height / 2;
      return (
        height - padding - ((value - minValue) / effectiveRange) * chartHeight
      );
    };

    const points = values
      .map((value, index) => ({
        x: xScale(index),
        y: yScale(value),
      }))
      .filter((point) => !isNaN(point.x) && !isNaN(point.y));

    // Only draw line if we have at least 2 valid points
    const pathData =
      points.length >= 2
        ? points
            .map(
              (point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
            )
            .join(" ")
        : "";

    return (
      <svg width={width} height={height} className="w-full h-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <g key={index}>
            <line
              x1={padding}
              y1={padding + ratio * chartHeight}
              x2={width - padding}
              y2={padding + ratio * chartHeight}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={padding + ratio * chartHeight + 4}
              textAnchor="end"
              fontSize="12"
              fill="#6B7280"
            >
              {Math.round(
                maxValue - ratio * (maxValue - minValue)
              ).toLocaleString()}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {data.labels.map((label, index) => {
          const x = xScale(index);
          if (isNaN(x)) return null;
          return (
            <text
              key={index}
              x={x}
              y={height - 10}
              textAnchor="middle"
              fontSize="12"
              fill="#6B7280"
            >
              {label}
            </text>
          );
        })}

        {/* Line - only draw if we have valid path data */}
        {pathData && (
          <path
            d={pathData}
            stroke={data.datasets[0].borderColor || "#3B82F6"}
            strokeWidth="3"
            fill="none"
          />
        )}

        {/* Points - only draw valid points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={data.datasets[0].borderColor || "#3B82F6"}
          />
        ))}
      </svg>
    );
  };

  // Bar chart component for hospital comparison (uses selectedMetric)
  const BarChart = () => {
    if (!hospitals || hospitals.length === 0) return null;

    const metricUnits: Record<string, string> = {
      kwh_usage: "kWh",
      water_usage_m3: "m³",
      co2_emissions: "kg CO₂e",
      total_waste: "kg",
    };

    const getValue = (h: any) => {
      switch (selectedMetric) {
        case "kwh_usage":
          return h.current_month_totals.kwh_usage;
        case "water_usage_m3":
          return h.current_month_totals.water_usage_m3;
        case "co2_emissions":
          return h.current_month_totals.co2_emissions;
        case "total_waste":
          return (
            (h.current_month_totals.waste_type1 || 0) +
            (h.current_month_totals.waste_type2 || 0) +
            (h.current_month_totals.waste_type3 || 0) +
            (h.current_month_totals.waste_type4 || 0)
          );
        default:
          return 0;
      }
    };

    const unit = metricUnits[selectedMetric] || "";

    const topHospitals = hospitals
      .map((h) => ({ ...h, value: getValue(h) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const maxValue = Math.max(...topHospitals.map((h) => h.value), 0);

    return (
      <div className="space-y-3">
        {topHospitals.map((hospital) => {
          const percentage =
            maxValue > 0 ? (hospital.value / maxValue) * 100 : 0;
          return (
            <div key={hospital.id} className="flex items-center space-x-3">
              <div
                className="w-40 text-sm font-medium truncate"
                title={hospital.name}
              >
                {hospital.name}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-28 text-sm text-gray-600 text-right">
                {Number(hospital.value).toLocaleString()} {unit}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#225384] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading data analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Analysis</h1>
        <p className="text-gray-600 mt-2">
          Analyze sustainability metrics across all hospitals
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-gray-500" />
          <Select value={selectedHospital} onValueChange={setSelectedHospital}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hospitals</SelectItem>
              {hospitals.map((hospital) => (
                <SelectItem key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-gray-500" />
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kwh_usage">Electricity Usage</SelectItem>
              <SelectItem value="water_usage_m3">Water Usage</SelectItem>
              <SelectItem value="co2_emissions">CO₂ Emissions</SelectItem>
              <SelectItem value="total_waste">Total Waste</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Cards */}
      {summaryMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryMetrics.totalUsage} {summaryMetrics.unit}
              </div>
              <div className="text-xs text-muted-foreground">
                <Badge
                  variant={
                    summaryMetrics.change >= 0 ? "destructive" : "default"
                  }
                  className="mr-1"
                >
                  {summaryMetrics.change >= 0 ? "+" : ""}
                  {summaryMetrics.change.toFixed(1)}%
                </Badge>
                from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average per Hospital
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryMetrics.averagePerHospital} {summaryMetrics.unit}
              </div>
              <div className="text-xs text-muted-foreground">
                Across {hospitals.length} hospitals
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Usage</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryMetrics.peakUsage} {summaryMetrics.unit}
              </div>
              <div className="text-xs text-muted-foreground">
                Highest single hospital
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Efficiency Score
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryMetrics.efficiencyScore}%
              </div>
              <div className="text-xs text-muted-foreground">
                Based on usage trends
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {chartData ? (
                <LineChart data={chartData} />
              ) : (
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hospital Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-y-auto">
              {hospitals.length > 0 ? (
                <BarChart />
              ) : (
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No hospital data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
