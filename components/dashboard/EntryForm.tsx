"use client";

import { EntryFormProps } from "@/types/dashboard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const entrySchema = z.object({
  kwh_usage: z.number().min(0, "Must be a positive number"),
  water_usage_m3: z.number().min(0, "Must be a positive number"),
});

type FormData = z.infer<typeof entrySchema>;

export function EntryForm({
  initialData,
  onSubmit,
  onSaveDraft,
  isLoading,
}: EntryFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      kwh_usage: initialData?.kwh_usage || 0,
      water_usage_m3: initialData?.water_usage_m3 || 0,
    },
  });

  const handleSubmit = async (data: FormData) => {
    await onSubmit(data);
  };

  const handleSaveDraft = async () => {
    const data = form.getValues();
    await onSaveDraft(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Sustainability Data Entry</CardTitle>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
          <strong>Note:</strong> CO₂ emissions are automatically calculated from
          your inputs using industry-standard emission factors.
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="kwh_usage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Electricity Usage (kWh)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save as Draft"
                )}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Entry"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
