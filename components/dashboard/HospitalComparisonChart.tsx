"use client";

import { Entry, Hospital } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface HospitalComparisonChartProps {
  hospitals: Hospital[];
  entries: Entry[];
  metric: "kwh_usage" | "water_usage_m3" | "co2_emissions";
  title: string;
  unit: string;
  isLoading?: boolean;
}

export function HospitalComparisonChart({
  hospitals,
  entries,
  metric,
  title,
  unit,
  isLoading,
}: HospitalComparisonChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Process data for chart
  const chartData = hospitals.map((hospital) => {
    const hospitalEntry = entries.find(
      (entry) => entry.hospital_id === hospital.id
    );
    return {
      name: hospital.name,
      value: hospitalEntry?.[metric] || 0,
    };
  });

  // Sort by value for better visualization
  chartData.sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickMargin={10}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickMargin={10}
                tickFormatter={(value) => `${value} ${unit}`}
              />
              <Tooltip
                formatter={(value: number) => [`${value} ${unit}`, title]}
                labelFormatter={(label) => `Hospital: ${label}`}
              />
              <Bar dataKey="value" fill="#225384" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
