"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormById } from "@/hooks/useFormById";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function DepartmentDataEntryForm() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  // Parse formId to extract hospital_id, month, year
  const parseFormId = (id: string) => {
    // The format is: {hospitalId}-{MM}-{YYYY}
    // We need to handle cases where hospitalId might contain hyphens
    // So we split by the last two hyphens to get month and year
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

    // Validate month and year
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
            Invalid form ID format. Please check the URL and try again.
            <br />
            <span className="text-sm">Expected format: hospitalId-MM-YYYY</span>
            <br />
            <span className="text-sm">Received: {formId}</span>
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const { form, loading, error, saving, saveForm, submitForm, refresh } =
    useFormById(formId);

  const handleSave = async (data: Record<string, number>) => {
    try {
      console.log("Saving form data:", data);
      await saveForm(data);
      console.log("Form saved successfully");
    } catch (error) {
      console.error("Error saving form:", error);
      // You could add user notification here
    }
  };

  const handleSubmit = async (data: Record<string, number>) => {
    try {
      console.log("Submitting form data:", data);
      await submitForm(data);
      console.log("Form submitted successfully");
      // Redirect back to the forms list after successful submission
      setTimeout(() => {
        router.push("/department/data-entry");
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
      // You could add user notification here
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Error loading form: {error}</AlertDescription>
        </Alert>
        <div className="flex space-x-3">
          <Button onClick={refresh}>Try Again</Button>
          <Button
            variant="outline"
            onClick={() => router.push("/department/data-entry")}
          >
            Back to Forms
          </Button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Form not found. Please check the URL and try again.
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push("/department/data-entry")}
        >
          Back to Forms
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
            onClick={() => router.push("/department/data-entry")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Forms</span>
          </Button>
        </div>
      </div>

      {/* Form */}
      <DynamicForm
        formId={formId}
        hospitalId={hospitalId}
        month={month}
        year={year}
        initialData={form.data}
        onSave={handleSave}
        onSubmit={handleSubmit}
        isSubmitted={form.submitted}
        loading={loading}
        saving={saving}
      />

      {/* Form Info */}
      <div className="text-sm text-gray-600">
        <p>Form ID: {formId}</p>
        <p>
          Created:{" "}
          {form.created_at
            ? new Date(form.created_at).toLocaleDateString()
            : "N/A"}
        </p>
        {form.updated_at && (
          <p>Last Updated: {new Date(form.updated_at).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
}
