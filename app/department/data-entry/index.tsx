"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyFormList } from "@/hooks/useFormList";
import { useRouter } from "next/navigation";
import { FileText, Eye, Edit, Calendar } from "lucide-react";
import { FormListEntry } from "@/types/forms";

export default function DepartmentDataEntryList() {
  const { forms, loading, error, refresh } = useMyFormList();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading forms: {error}</p>
              <Button onClick={refresh} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Past Forms</h1>
        <p className="text-gray-600 mt-2">
          View and edit your submitted sustainability forms
        </p>
      </div>

      {/* Forms Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Monthly Sustainability Forms</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form: FormListEntry) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{form.form_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={form.submitted ? "secondary" : "default"}
                      className={
                        form.submitted
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {form.submitted ? "Submitted" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {form.submitted && form.submitted_at ? (
                      new Date(form.submitted_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    ) : (
                      <span className="text-gray-400">Not submitted</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/department/data-entry/${form.id}`)
                      }
                      className="flex items-center space-x-1"
                    >
                      {form.submitted ? (
                        <>
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </>
                      ) : (
                        <>
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {forms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No forms found</p>
              <p className="text-sm">
                Forms will appear here once you start submitting data
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {forms.filter((f: FormListEntry) => f.submitted).length}
              </div>
              <div className="text-sm text-gray-600">Submitted Forms</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {forms.filter((f: FormListEntry) => !f.submitted).length}
              </div>
              <div className="text-sm text-gray-600">Draft Forms</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {forms.length > 0
                  ? Math.round(
                      (forms.filter((f: FormListEntry) => f.submitted).length /
                        forms.length) *
                        100
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
