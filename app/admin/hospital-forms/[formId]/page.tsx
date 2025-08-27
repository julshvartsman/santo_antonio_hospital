"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle, Building } from "lucide-react";
import { useFormById } from "@/hooks/useFormById";
import { useHospitals } from "@/hooks/useHospitals";
import { useApp } from "@/components/providers/AppProvider";

export default function AdminHospitalFormEntry() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = params.formId as string;
  const isViewMode = searchParams.get("view") === "true";

  // Parse formId to extract hospital_id, month, year
  const parseFormId = (id: string) => {
    const lastHyphenIndex = id.lastIndexOf("-");
    const secondLastHyphenIndex = id.lastIndexOf("-", lastHyphenIndex - 1);

    if (lastHyphenIndex === -1 || secondLastHyphenIndex === -1) {
      throw new Error("Invalid form ID format");
    }

    const hospitalId = id.substring(0, secondLastHyphenIndex);
    const monthStr = id.substring(secondLastHyphenIndex + 1, lastHyphenIndex);
    const yearStr = id.substring(lastHyphenIndex + 1);

    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    if (isNaN(month) || month < 1 || month > 12) {
      throw new Error("Invalid month in form ID");
    }

    if (isNaN(year) || year < 2020 || year > 2030) {
      throw new Error("Invalid year in form ID");
    }

    return { hospitalId, month, year };
  };

  let hospitalId: string;
  let month: number;
  let year: number;

  try {
    const parsed = parseFormId(formId);
    hospitalId = parsed.hospitalId;
    month = parsed.month;
    year = parsed.year;
  } catch (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Invalid form ID:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/hospital-forms")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Hospital Forms
        </Button>
      </div>
    );
  }

  const { form, loading, saving, error, saveForm, submitForm } =
    useFormById(formId);
  const { hospitals } = useHospitals();
  const { language } = useApp();

  const hospital = hospitals.find((h) => h.id === hospitalId);
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

  const handleSave = async (data: Record<string, any>) => {
    try {
      await saveForm(data);
    } catch (error) {
      console.error("Error saving form:", error);
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await submitForm(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#225384] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/hospital-forms")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Hospital Forms
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/hospital-forms")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Hospital Forms</span>
          </Button>
        </div>
      </div>

      {/* Form Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Building className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-blue-900">
            {hospital?.name || "Unknown Hospital"}
          </h2>
        </div>
        <p className="text-blue-700">
          {monthNames[month - 1]} {year} - Sustainability Data Entry
        </p>
        {isViewMode && (
          <p className="text-blue-600 text-sm mt-1">
            <strong>View Mode:</strong> This form has been submitted and is
            read-only
          </p>
        )}
      </div>

      {/* Form */}
      <DynamicForm
        formId={formId}
        hospitalId={hospitalId}
        month={month}
        year={year}
        initialData={form?.data}
        onSave={handleSave}
        onSubmit={handleSubmit}
        isSubmitted={form?.submitted}
        loading={loading}
        saving={saving}
      />

      {/* Form Info */}
      <div className="text-sm text-gray-600">
        <p>Form ID: {formId}</p>
        <p>
          Created:{" "}
          {form?.created_at
            ? new Date(form.created_at).toLocaleDateString()
            : "N/A"}
        </p>
        {form?.updated_at && (
          <p>Last Updated: {new Date(form.updated_at).toLocaleDateString()}</p>
        )}
        {form?.submitted_at && (
          <p>Submitted: {new Date(form.submitted_at).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
}
