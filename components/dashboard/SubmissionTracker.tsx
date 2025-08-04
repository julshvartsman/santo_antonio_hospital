"use client";

import { SubmissionTrackerProps } from "@/types/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function SubmissionTracker({
  dueDate,
  submittedHospitals,
  totalHospitals,
  isLoading,
}: SubmissionTrackerProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[300px] mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-[100px]" />
        </CardContent>
      </Card>
    );
  }

  const submissionPercentage = (submittedHospitals / totalHospitals) * 100;
  const daysUntilDue = Math.ceil(
    (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission Progress</CardTitle>
        <CardDescription>
          Track monthly data submission progress across all hospitals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Progress value={submissionPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {submittedHospitals} of {totalHospitals} hospitals submitted
          </p>
        </div>
        <div
          className={`text-sm ${
            daysUntilDue <= 3 ? "text-red-500" : "text-muted-foreground"
          }`}
        >
          {daysUntilDue > 0
            ? `${daysUntilDue} days until deadline`
            : "Submission deadline passed"}
        </div>
      </CardContent>
    </Card>
  );
}
