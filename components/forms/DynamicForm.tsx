"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FormMetric } from "@/types/forms";
import { Save, Send, AlertTriangle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

// Define the 7 required sustainability metrics
const SUSTAINABILITY_METRICS: FormMetric[] = [
  {
    key: "kwh_usage",
    label: "Electricity Usage",
    unit: "kWh",
    type: "number",
    required: true,
    min: 0,
    description: "Total electricity consumption for the month",
  },
  {
    key: "water_usage_m3",
    label: "Water Usage",
    unit: "m³",
    type: "number",
    required: true,
    min: 0,
    description: "Total water consumption for the month",
  },
  {
    key: "type1",
    label: "Type 1 Waste Residuals",
    unit: "kg",
    type: "number",
    required: true,
    min: 0,
    description: "Type 1 waste residuals for the month",
  },
  {
    key: "type2",
    label: "Type 2 Waste Residuals",
    unit: "kg",
    type: "number",
    required: true,
    min: 0,
    description: "Type 2 waste residuals for the month",
  },
  {
    key: "type3",
    label: "Type 3 Waste Residuals",
    unit: "kg",
    type: "number",
    required: true,
    min: 0,
    description: "Type 3 waste residuals for the month",
  },
  {
    key: "type4",
    label: "Type 4 Waste Residuals",
    unit: "kg",
    type: "number",
    required: true,
    min: 0,
    description: "Type 4 waste residuals for the month",
  },
  {
    key: "km_travelled_gas",
    label: t("metrics.kilometersGasKm"),
    unit: "km",
    type: "number",
    required: false,
    min: 0,
    description: t("metrics.kilometersGas"),
  },
  {
    key: "km_travelled_diesel",
    label: t("metrics.kilometersDieselKm"),
    unit: "km",
    type: "number",
    required: false,
    min: 0,
    description: t("metrics.kilometersDiesel"),
  },
  {
    key: "km_travelled_gasoline",
    label: t("metrics.kilometersGasolineKm"),
    unit: "km",
    type: "number",
    required: false,
    min: 0,
    description: t("metrics.kilometersGasoline"),
  },
  {
    key: "license_plate",
    label: t("metrics.licensePlateNumber"),
    unit: "",
    type: "text",
    required: false,
    description: t("metrics.vehicleIdentifier"),
  },
  {
    key: "renewable_energy_created",
    label: t("metrics.renewableEnergyCreated"),
    unit: "kWh",
    type: "number",
    required: false,
    min: 0,
    description: t("metrics.renewableEnergyOnSite"),
  },
];

interface DynamicFormProps {
  formId: string;
  hospitalId: string;
  month: number;
  year: number;
  initialData?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => void;
  onSave?: (data: Record<string, any>) => void;
  isSubmitted?: boolean;
  loading?: boolean;
  saving?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  formId,
  hospitalId,
  month,
  year,
  initialData = {},
  onSubmit,
  onSave,
  isSubmitted = false,
  loading = false,
  saving = false,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    SUSTAINABILITY_METRICS.forEach((metric) => {
      const value = formData[metric.key];

      if (
        metric.required &&
        (value === undefined || value === null || value === "" || value === 0)
      ) {
        newErrors[metric.key] = `${metric.label} is required`;
      } else if (value !== undefined && value !== null) {
        if (
          metric.type === "number" &&
          metric.min !== undefined &&
          value < metric.min
        ) {
          newErrors[
            metric.key
          ] = `${metric.label} must be at least ${metric.min}`;
        }
        if (
          metric.type === "number" &&
          metric.max !== undefined &&
          value > metric.max
        ) {
          newErrors[
            metric.key
          ] = `${metric.label} must be at most ${metric.max}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    key: string,
    value: string,
    type: string = "number"
  ) => {
    let finalValue: any = value;
    if (type === "number") {
      const numValue = value === "" ? 0 : parseFloat(value);
      finalValue = isNaN(numValue) ? 0 : numValue;
    }

    setFormData((prev) => ({
      ...prev,
      [key]: finalValue,
    }));

    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        await onSave?.(formData);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error("Error saving form:", error);
        // You could add error state handling here if needed
      }
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await onSubmit?.(formData);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error("Error submitting form:", error);
        // You could add error state handling here if needed
      }
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading form...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Sustainability Metrics</span>
              {isSubmitted && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Submitted
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {monthNames[month - 1]} {year} - {hospitalId}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Form saved successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SUSTAINABILITY_METRICS.map((metric) => (
            <div key={metric.key} className="space-y-2">
              <Label
                htmlFor={metric.key}
                className="flex items-center space-x-2"
              >
                <span>{metric.label}</span>
                {metric.required && <span className="text-red-500">*</span>}
              </Label>
              {metric.type === "select" ? (
                <select
                  id={metric.key}
                  value={(formData[metric.key] as string) || ""}
                  onChange={(e) =>
                    handleInputChange(metric.key, e.target.value, "select")
                  }
                  className={`w-full rounded-md border px-3 py-2 text-sm ${
                    errors[metric.key] ? "border-red-500" : "border-input"
                  }`}
                  disabled={isSubmitted}
                >
                  <option value="">Select fuel type</option>
                  {metric.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={metric.key}
                  type={metric.type === "text" ? "text" : "number"}
                  value={(formData[metric.key] as any) ?? ""}
                  onChange={(e) =>
                    handleInputChange(metric.key, e.target.value, metric.type)
                  }
                  placeholder={`Enter ${metric.label.toLowerCase()}`}
                  min={metric.min}
                  max={metric.max}
                  step={metric.type === "percentage" ? "0.1" : "0.01"}
                  className={errors[metric.key] ? "border-red-500" : ""}
                  disabled={isSubmitted}
                />
              )}
              {errors[metric.key] && (
                <p className="text-sm text-red-600">{errors[metric.key]}</p>
              )}
              <p className="text-xs text-gray-500">
                {metric.description} {metric.unit ? `(${metric.unit})` : ""}
              </p>
            </div>
          ))}
        </div>

        {!isSubmitted && (
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Save Draft"}</span>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{saving ? "Submitting..." : "Submit Data"}</span>
            </Button>
          </div>
        )}

        {isSubmitted && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              This form has been submitted and cannot be edited. Contact an
              administrator if you need to make changes.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
