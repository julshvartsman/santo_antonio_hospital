"use client";

import { HospitalStatusGridProps } from "@/types/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function HospitalStatusGrid({
  hospitals,
  isLoading,
}: HospitalStatusGridProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[300px] mt-2" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospital Submission Status</CardTitle>
        <CardDescription>
          Current month's data submission status for all hospitals
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hospitals.map((hospital) => (
          <Card key={hospital.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{hospital.name}</h3>
                {hospital.status === "submitted" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : hospital.status === "draft" ? (
                  <Clock className="h-5 w-5 text-yellow-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {hospital.status === "submitted"
                  ? `Submitted: ${new Date(
                      hospital.lastSubmission!
                    ).toLocaleDateString()}`
                  : hospital.status === "draft"
                  ? "Draft saved"
                  : "No submission"}
              </p>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
