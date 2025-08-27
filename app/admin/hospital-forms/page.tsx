"use client";

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Calendar,
  FileText,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { supabase } from "@/lib/supabaseClient";
import { useHospitals } from "@/hooks/useHospitals";

interface HospitalForm {
  id: string;
  hospital_id: string;
  hospital_name: string;
  month: number;
  year: number;
  submitted: boolean;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function HospitalFormsPage() {
  const { language } = useApp();
  const router = useRouter();
  const { hospitals, loading: hospitalsLoading } = useHospitals();
  const [selectedHospital, setSelectedHospital] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("current");
  const [selectedYear, setSelectedYear] = useState<string>("current");
  const [hospitalForms, setHospitalForms] = useState<HospitalForm[]>([]);
  const [loading, setLoading] = useState(true);

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

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    fetchHospitalForms();
  }, [selectedHospital, selectedMonth, selectedYear]);

  const fetchHospitalForms = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("forms")
        .select(
          `
          *,
          hospitals!hospital_id (
            name
          )
        `
        )
        .order("created_at", { ascending: false });

      // Filter by hospital if selected
      if (selectedHospital !== "all") {
        query = query.eq("hospital_id", selectedHospital);
      }

      // Filter by month if selected
      if (selectedMonth !== "current") {
        query = query.eq("month", parseInt(selectedMonth));
      } else {
        query = query.eq("month", currentMonth);
      }

      // Filter by year if selected
      if (selectedYear !== "current") {
        query = query.eq("year", parseInt(selectedYear));
      } else {
        query = query.eq("year", currentYear);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching hospital forms:", error);
        return;
      }

      // Transform the data
      const transformedForms: HospitalForm[] = (data || []).map(
        (form: any) => ({
          id: form.id,
          hospital_id: form.hospital_id,
          hospital_name: form.hospitals?.name || "Unknown Hospital",
          month: form.month,
          year: form.year,
          submitted: form.submitted,
          submitted_at: form.submitted_at,
          created_at: form.created_at,
          updated_at: form.updated_at,
        })
      );

      setHospitalForms(transformedForms);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = (hospitalId: string) => {
    const month =
      selectedMonth === "current" ? currentMonth : parseInt(selectedMonth);
    const year =
      selectedYear === "current" ? currentYear : parseInt(selectedYear);
    const formId = `${hospitalId}-${month.toString().padStart(2, "0")}-${year}`;
    router.push(`/admin/hospital-forms/${formId}`);
  };

  const handleEditForm = (formId: string) => {
    router.push(`/admin/hospital-forms/${formId}`);
  };

  const handleViewForm = (formId: string) => {
    router.push(`/admin/hospital-forms/${formId}?view=true`);
  };

  const getStatusBadge = (submitted: boolean, submittedAt: string | null) => {
    if (submitted) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          {language.t("admin.hospitalForms.submitted")}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" />
        {language.t("admin.hospitalForms.pending")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {language.t("admin.hospitalForms.title")}
        </h1>
        <p className="text-gray-600 mt-2">
          {language.t("admin.hospitalForms.description")}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {language.t("admin.hospitalForms.filters")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-500" />
              <Select
                value={selectedHospital}
                onValueChange={setSelectedHospital}
              >
                <SelectTrigger className="w-48">
                  <SelectValue
                    placeholder={language.t(
                      "admin.hospitalForms.selectHospital"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language.t("admin.hospitalForms.allHospitals")}
                  </SelectItem>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    {language.t("admin.hospitalForms.currentMonth")}
                  </SelectItem>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    {language.t("admin.hospitalForms.currentYear")}
                  </SelectItem>
                  {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(
                    (year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={fetchHospitalForms} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {language.t("admin.hospitalForms.refresh")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hospital Forms Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {language.t("admin.hospitalForms.hospitalForms")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#225384] mx-auto"></div>
              <p className="text-gray-500 mt-2">
                {language.t("admin.hospitalForms.loading")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {language.t("admin.hospitalForms.hospital")}
                  </TableHead>
                  <TableHead>
                    {language.t("admin.hospitalForms.monthYear")}
                  </TableHead>
                  <TableHead>
                    {language.t("admin.hospitalForms.status")}
                  </TableHead>
                  <TableHead>
                    {language.t("admin.hospitalForms.submittedAt")}
                  </TableHead>
                  <TableHead>
                    {language.t("admin.hospitalForms.lastUpdated")}
                  </TableHead>
                  <TableHead>
                    {language.t("admin.hospitalForms.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hospitalForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">
                      {form.hospital_name}
                    </TableCell>
                    <TableCell>
                      {monthNames[form.month - 1]} {form.year}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(form.submitted, form.submitted_at)}
                    </TableCell>
                    <TableCell>
                      {form.submitted_at
                        ? new Date(form.submitted_at).toLocaleDateString()
                        : language.t("admin.hospitalForms.notSubmitted")}
                    </TableCell>
                    <TableCell>
                      {new Date(form.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {form.submitted ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewForm(form.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {language.t("admin.hospitalForms.view")}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditForm(form.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {language.t("admin.hospitalForms.edit")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && hospitalForms.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {language.t("admin.hospitalForms.noForms")}
              </p>
              {selectedHospital !== "all" && (
                <Button
                  className="mt-4"
                  onClick={() => handleCreateForm(selectedHospital)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {language.t("admin.hospitalForms.createNew")}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
