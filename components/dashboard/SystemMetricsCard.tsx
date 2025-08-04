"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SystemMetricsCardProps {
  title: string;
  metrics: {
    label: string;
    value: number | string;
    change?: number;
  }[];
  isLoading?: boolean;
}

export function SystemMetricsCard({
  title,
  metrics,
  isLoading,
}: SystemMetricsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[300px] mt-2" />
        </CardHeader>
        <CardContent className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>System-wide sustainability metrics</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0"
          >
            <span className="text-sm text-muted-foreground">
              {metric.label}
            </span>
            <div className="flex items-center">
              <span className="font-medium">{metric.value}</span>
              {metric.change !== undefined && (
                <span
                  className={`ml-2 text-xs ${
                    metric.change > 0
                      ? "text-red-500"
                      : metric.change < 0
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}%
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
