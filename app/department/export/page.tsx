"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, Calendar, FileText, BarChart3 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function DepartmentExport() {
  const { t } = useLanguage();
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["csv"]);
  const [selectedData, setSelectedData] = useState<string[]>([
    "energy",
    "water",
  ]);

  const handleFormatChange = (format: string) => {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  };

  const handleDataChange = (dataType: string) => {
    setSelectedData((prev) =>
      prev.includes(dataType)
        ? prev.filter((d) => d !== dataType)
        : [...prev, dataType]
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Export Data</h1>
        <p className="text-gray-600 mt-2">
          Export your department's sustainability data for analysis and
          reporting
        </p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Select Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="energy"
                  checked={selectedData.includes("energy")}
                  onCheckedChange={() => handleDataChange("energy")}
                />
                <Label htmlFor="energy">{t("metrics.energyUsageData")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="water"
                  checked={selectedData.includes("water")}
                  onCheckedChange={() => handleDataChange("water")}
                />
                <Label htmlFor="water">Water Usage Data</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="waste"
                  checked={selectedData.includes("waste")}
                  onCheckedChange={() => handleDataChange("waste")}
                />
                <Label htmlFor="waste">Waste Management Data</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recycling"
                  checked={selectedData.includes("recycling")}
                  onCheckedChange={() => handleDataChange("recycling")}
                />
                <Label htmlFor="recycling">Recycling Data</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reports"
                  checked={selectedData.includes("reports")}
                  onCheckedChange={() => handleDataChange("reports")}
                />
                <Label htmlFor="reports">Monthly Reports</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Format */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export Format</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="csv"
                  checked={selectedFormats.includes("csv")}
                  onCheckedChange={() => handleFormatChange("csv")}
                />
                <Label htmlFor="csv">CSV Format</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="excel"
                  checked={selectedFormats.includes("excel")}
                  onCheckedChange={() => handleFormatChange("excel")}
                />
                <Label htmlFor="excel">Excel Format</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pdf"
                  checked={selectedFormats.includes("pdf")}
                  onCheckedChange={() => handleFormatChange("pdf")}
                />
                <Label htmlFor="pdf">PDF Report</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Date Range</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <input
                type="date"
                id="start-date"
                className="w-full p-2 border border-gray-300 rounded-md"
                defaultValue="2024-01-01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <input
                type="date"
                id="end-date"
                className="w-full p-2 border border-gray-300 rounded-md"
                defaultValue="2024-01-31"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Last Month</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Last 3 Months</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Last Year</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-center">
        <Button size="lg" className="flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Export Data</span>
        </Button>
      </div>
    </div>
  );
}
