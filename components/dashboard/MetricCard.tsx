"use client";

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  target?: number;
  trend?: number;
  isLoading?: boolean;
}

export function MetricCard({
  title,
  value,
  unit,
  target,
  trend,
  isLoading,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  const isOverTarget = target ? value > target : false;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        {trend !== undefined && (
          <div
            className={`flex items-center px-2 py-1 rounded text-xs font-medium ${
              trend > 0
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {trend > 0 ? (
              <ArrowUpIcon className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 mr-1" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">
          {value.toLocaleString()}
          <span className="text-base font-medium text-gray-500 ml-1">
            {unit}
          </span>
        </div>

        {target && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Target</span>
            <span
              className={`text-xs font-medium ${
                isOverTarget ? "text-red-600" : "text-green-600"
              }`}
            >
              {target.toLocaleString()} {unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
