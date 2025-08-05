"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

// Form validation schema
const dataEntrySchema = z.object({
  month_year: z.string().min(1, "Please enter a month and year (e.g., 'January 2024' or '2024-01')"),
  kwh_usage: z.number().min(0, "KWH usage must be a positive number"),
  water_usage_m3: z.number().min(0, "Water usage must be a positive number"),
  co2_emissions: z.number().min(0, "CO2 emissions must be a positive number"),
  submitted: z.boolean().default(false),
});

type DataEntryFormData = z.infer<typeof dataEntrySchema>;

export default function DataEntryPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("");

  const form = useForm<DataEntryFormData>({
    resolver: zodResolver(dataEntrySchema),
    defaultValues: {
      month_year: "",
      kwh_usage: 0,
      water_usage_m3: 0,
      co2_emissions: 0,
      submitted: false,
    },
  });

  // Test connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const startTime = Date.now();
        const { data, error } = await supabase
          .from("entries")
          .select("id")
          .limit(1);
        const endTime = Date.now();
        
        if (error) {
          setConnectionStatus(`Connection error: ${error.message}`);
        } else {
          setConnectionStatus(`Connection OK (${endTime - startTime}ms)`);
        }
      } catch (err) {
        setConnectionStatus(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    if (user) {
      testConnection();
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!user) {
    return null;
  }

  const onSubmit = async (data: DataEntryFormData) => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSubmitSuccess(false);

    try {
      // Convert month_year string to proper date format
      // Parse the month/year string and convert to YYYY-MM-01 format
      let monthYearDate;
      try {
        // Try to parse common date formats
        const dateStr = data.month_year.trim();
        if (dateStr.match(/^\d{4}-\d{2}$/)) {
          // Format: YYYY-MM
          monthYearDate = `${dateStr}-01`;
        } else if (dateStr.match(/^\w+ \d{4}$/)) {
          // Format: "January 2024"
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            throw new Error("Invalid date format");
          }
          monthYearDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        } else {
          // Try direct date parsing
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            throw new Error("Invalid date format");
          }
          monthYearDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        }
      } catch (dateError) {
        throw new Error("Please enter a valid month and year (e.g., 'January 2024' or '2024-01')");
      }

      // Prepare the data for submission - simplified
      const submissionData = {
        user_id: user.id,
        hospital_id: user.hospital_id,
        month_year: monthYearDate,
        kwh_usage: data.kwh_usage,
        water_usage_m3: data.water_usage_m3,
        co2_emissions: data.co2_emissions,
        submitted: true,
        submitted_at: new Date().toISOString(),
      };

      console.log("Submitting data:", submissionData);
      console.log("User info:", { id: user.id, hospital_id: user.hospital_id });

      // Test connection first
      console.log("Testing database connection...");
      const testStart = Date.now();
      const { data: testData, error: testError } = await supabase
        .from("entries")
        .select("id")
        .limit(1);
      const testEnd = Date.now();
      console.log(`Connection test took ${testEnd - testStart}ms`);

      if (testError) {
        console.error("Connection test failed:", testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }

      // Insert data into the entries table
      console.log("Inserting data...");
      const insertStart = Date.now();
      const { data: result, error } = await supabase
        .from("entries")
        .insert([submissionData])
        .select();
      const insertEnd = Date.now();
      console.log(`Insert operation took ${insertEnd - insertStart}ms`);

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message);
      }

      console.log("Data submitted successfully:", result);
      setSubmitSuccess(true);
      form.reset();
      
      // Show success message for 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);

    } catch (err) {
      console.error("Submission error:", err);
      setError(err instanceof Error ? err.message : "Failed to submit data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sustainability Data Entry
          </h1>
          <p className="text-gray-600">
            Enter monthly sustainability metrics for your hospital
          </p>
        </div>

        {/* Success Alert */}
        {submitSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Data submitted successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sustainability Report</CardTitle>
            <CardDescription>
              Enter your hospital's sustainability metrics for the selected month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Month/Year Input */}
                <FormField
                  control={form.control}
                  name="month_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month and Year</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter month and year (e.g., January 2024 or 2024-01)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* KWH Usage */}
                <FormField
                  control={form.control}
                  name="kwh_usage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KWH Usage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter KWH usage"
                          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Water Usage */}
                <FormField
                  control={form.control}
                  name="water_usage_m3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Water Usage (m³)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter water usage in cubic meters"
                          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CO2 Emissions */}
                <FormField
                  control={form.control}
                  name="co2_emissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CO2 Emissions</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter CO2 emissions"
                          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Submit Data
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">User ID:</span> {user.id}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Name:</span> {user.name}
              </div>
              <div>
                <span className="font-medium">Role:</span> {user.role}
              </div>
              <div>
                <span className="font-medium">Hospital ID:</span> {user.hospital_id || "Not assigned"}
              </div>
              <div>
                <span className="font-medium">Database Connection:</span>{" "}
                <span className={connectionStatus.includes("OK") ? "text-green-600" : "text-red-600"}>
                  {connectionStatus || "Testing..."}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Diagnostics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Network Diagnostics</CardTitle>
            <CardDescription>
              This helps identify if the issue is with your connection or the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Internet Connection:</span>
                <span className="text-sm text-green-600">✓ Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Supabase URL:</span>
                <span className="text-sm text-gray-600">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Configured" : "✗ Missing"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Key:</span>
                <span className="text-sm text-gray-600">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Configured" : "✗ Missing"}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-4">
                <p><strong>If you're experiencing slow performance:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Check your WiFi connection speed</li>
                  <li>Try refreshing the page</li>
                  <li>Clear your browser cache</li>
                  <li>Try a different browser</li>
                  <li>Check if other websites are also slow</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
