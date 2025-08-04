"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Entry, Hospital } from "@/types/dashboard";

interface ExportButtonProps {
  hospitals: Hospital[];
  entries: Entry[];
  isLoading?: boolean;
}

export function ExportButton({
  hospitals,
  entries,
  isLoading,
}: ExportButtonProps) {
  const handleExport = () => {
    // Prepare data for CSV
    const rows = entries.map((entry) => {
      const hospital = hospitals.find((h) => h.id === entry.hospital_id);
      return {
        "Hospital Name": hospital?.name || "",
        "Month/Year": new Date(entry.month_year).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        "Electricity Usage (kWh)": entry.kwh_usage,
        "Water Usage (m³)": entry.water_usage_m3,
        "CO2 Emissions (tons)": entry.co2_emissions,
        "Submission Status": entry.submitted ? "Submitted" : "Draft",
        "Submission Date": entry.submitted_at
          ? new Date(entry.submitted_at).toLocaleDateString()
          : "",
      };
    });

    // Convert to CSV
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row];
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");

    // Download file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "sustainability_data.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isLoading || entries.length === 0}
      variant="outline"
    >
      <Download className="h-4 w-4 mr-2" />
      Export Data
    </Button>
  );
}
