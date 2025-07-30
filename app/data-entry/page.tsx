"use client";

import React, { useState, useEffect } from "react";
import {
  Edit3,
  Lock,
  Unlock,
  Save,
  X,
  Filter,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApp } from "@/components/providers/AppProvider";
import { generateMockReports } from "@/utils/mockData";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { SustainabilityMetric, MonthlyReport } from "@/types";

interface EditingCell {
  metricId: string;
  field: "value" | "target";
  value: string;
}

// Disable static generation for this page
export const dynamic = "force-dynamic";

export default function DataEntryPage() {
  const { auth, language } = useApp();
  const [reports] = useState<MonthlyReport[]>(() => generateMockReports());
  const [currentReport, setCurrentReport] = useState<MonthlyReport>(
    () => reports.find((r) => !r.isCompleted) || reports[0]
  );
  const [metrics, setMetrics] = useState<SustainabilityMetric[]>(
    currentReport.metrics
  );
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Update metrics when report changes
  useEffect(() => {
    setMetrics(currentReport.metrics);
  }, [currentReport]);

  // Filter metrics based on search and category
  const filteredMetrics = metrics.filter((metric) => {
    const matchesSearch =
      metric.metric.toLowerCase().includes(filter.toLowerCase()) ||
      metric.category.toLowerCase().includes(filter.toLowerCase()) ||
      metric.subcategory.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || metric.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(metrics.map((m) => m.category)));

  const handleEdit = (
    metricId: string,
    field: "value" | "target",
    currentValue: number | null
  ) => {
    const metric = metrics.find((m) => m.id === metricId);
    if (metric?.isLocked && metric.lockedBy?.id !== auth.user?.id) {
      return; // Can't edit locked cells
    }

    setEditingCell({
      metricId,
      field,
      value: currentValue?.toString() || "",
    });
  };

  const handleSaveEdit = () => {
    if (!editingCell || !auth.user) return;

    const newValue = parseFloat(editingCell.value);
    if (isNaN(newValue)) return;

    setMetrics((prev) =>
      prev.map((metric) => {
        if (metric.id === editingCell.metricId) {
          return {
            ...metric,
            [editingCell.field]: newValue,
            lastUpdated: new Date(),
            updatedBy: auth.user!,
          };
        }
        return metric;
      })
    );

    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const handleToggleLock = (metricId: string) => {
    if (!auth.user) return;

    setMetrics((prev) =>
      prev.map((metric) => {
        if (metric.id === metricId) {
          const isCurrentlyLocked = metric.isLocked;

          // If unlocking, only admin or the locker can unlock
          if (
            isCurrentlyLocked &&
            metric.lockedBy?.id !== auth.user!.id &&
            auth.user!.role !== "admin"
          ) {
            return metric;
          }

          return {
            ...metric,
            isLocked: !isCurrentlyLocked,
            lockedBy: !isCurrentlyLocked ? auth.user! : undefined,
            lockedAt: !isCurrentlyLocked ? new Date() : undefined,
            lastUpdated: new Date(),
            updatedBy: auth.user!,
          };
        }
        return metric;
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const canEditMetric = (metric: SustainabilityMetric) => {
    if (!metric.isLocked) return true;
    if (!auth.user) return false;
    return metric.lockedBy?.id === auth.user.id || auth.user.role === "admin";
  };

  const canUnlockMetric = (metric: SustainabilityMetric) => {
    if (!auth.user) return false;
    return metric.lockedBy?.id === auth.user.id || auth.user.role === "admin";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {language.t("nav.dataEntry")}
        </h1>
        <p className="text-gray-600 mt-2">
          {language.language === "en"
            ? "Enter and manage monthly sustainability data for your hospital."
            : "Insira e gerencie dados mensais de sustentabilidade do seu hospital."}
        </p>
      </div>

      {/* Report Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {language.language === "en"
                ? "Monthly Report"
                : "Relatório Mensal"}
            </span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {language.language === "en" ? "Refresh" : "Atualizar"}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {language.language === "en" ? "Export" : "Exportar"}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            <div className="flex items-center justify-between">
              <span>
                {new Date(
                  currentReport.year,
                  currentReport.month - 1
                ).toLocaleDateString(
                  language.language === "en" ? "en-US" : "pt-BR",
                  { month: "long", year: "numeric" }
                )}
              </span>
              <div className="flex items-center space-x-2">
                {currentReport.isCompleted ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {language.language === "en" ? "Completed" : "Concluído"}
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {language.language === "en"
                      ? "In Progress"
                      : "Em Progresso"}
                  </span>
                )}
              </div>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={
                  language.language === "en"
                    ? "Search metrics..."
                    : "Buscar métricas..."
                }
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">
                  {language.language === "en"
                    ? "All Categories"
                    : "Todas Categorias"}
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            {language.t("data.sustainability")} ({filteredMetrics.length})
          </CardTitle>
          <CardDescription>
            {language.language === "en"
              ? "Click on values to edit. Use the lock/unlock buttons to control access."
              : "Clique nos valores para editar. Use os botões de bloqueio para controlar o acesso."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    {language.t("data.category")}
                  </TableHead>
                  <TableHead className="w-[150px]">Subcategory</TableHead>
                  <TableHead className="w-[200px]">
                    {language.t("data.metric")}
                  </TableHead>
                  <TableHead className="w-[100px] text-right">
                    {language.t("data.value")}
                  </TableHead>
                  <TableHead className="w-[80px]">
                    {language.t("data.unit")}
                  </TableHead>
                  <TableHead className="w-[100px] text-right">
                    {language.t("data.target")}
                  </TableHead>
                  <TableHead className="w-[100px] text-center">
                    {language.t("data.status")}
                  </TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMetrics.map((metric) => (
                  <TableRow
                    key={metric.id}
                    className={metric.isLocked ? "bg-gray-50" : ""}
                  >
                    <TableCell className="font-medium">
                      {metric.category}
                    </TableCell>
                    <TableCell>{metric.subcategory}</TableCell>
                    <TableCell>{metric.metric}</TableCell>

                    {/* Value Cell */}
                    <TableCell className="text-right">
                      {editingCell?.metricId === metric.id &&
                      editingCell.field === "value" ? (
                        <div className="flex items-center space-x-1">
                          <Input
                            type="number"
                            value={editingCell.value}
                            onChange={(e) =>
                              setEditingCell({
                                ...editingCell,
                                value: e.target.value,
                              })
                            }
                            onKeyDown={handleKeyDown}
                            className="w-20 h-8 text-right"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={handleSaveEdit}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleEdit(metric.id, "value", metric.value)
                          }
                          disabled={!canEditMetric(metric)}
                          className={`text-right w-full hover:bg-gray-100 px-2 py-1 rounded ${
                            canEditMetric(metric)
                              ? "cursor-pointer"
                              : "cursor-not-allowed opacity-50"
                          }`}
                        >
                          {metric.value ? formatNumber(metric.value) : "-"}
                        </button>
                      )}
                    </TableCell>

                    <TableCell className="text-sm text-gray-500">
                      {metric.unit}
                    </TableCell>

                    {/* Target Cell */}
                    <TableCell className="text-right">
                      {editingCell?.metricId === metric.id &&
                      editingCell.field === "target" ? (
                        <div className="flex items-center space-x-1">
                          <Input
                            type="number"
                            value={editingCell.value}
                            onChange={(e) =>
                              setEditingCell({
                                ...editingCell,
                                value: e.target.value,
                              })
                            }
                            onKeyDown={handleKeyDown}
                            className="w-20 h-8 text-right"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={handleSaveEdit}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleEdit(
                              metric.id,
                              "target",
                              metric.target ?? null
                            )
                          }
                          disabled={!canEditMetric(metric)}
                          className={`text-right w-full hover:bg-gray-100 px-2 py-1 rounded ${
                            canEditMetric(metric)
                              ? "cursor-pointer"
                              : "cursor-not-allowed opacity-50"
                          }`}
                        >
                          {metric.target ? formatNumber(metric.target) : "-"}
                        </button>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {metric.isLocked ? (
                        <div className="flex items-center justify-center">
                          <Lock className="h-4 w-4 text-red-500" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Edit3 className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleToggleLock(metric.id)}
                          disabled={metric.isLocked && !canUnlockMetric(metric)}
                          title={
                            metric.isLocked
                              ? `Locked by ${
                                  metric.lockedBy?.name
                                } on ${formatDateTime(metric.lockedAt!)}`
                              : "Click to lock this metric"
                          }
                        >
                          {metric.isLocked ? (
                            <Unlock className="h-4 w-4 text-red-500" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredMetrics.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {language.language === "en"
                ? "No metrics found."
                : "Nenhuma métrica encontrada."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {language.language === "en" ? (
            <>
              <strong>Instructions:</strong> Click on value or target cells to
              edit them. Use the lock button to prevent other users from editing
              specific metrics. Only administrators can unlock metrics locked by
              other users.
            </>
          ) : (
            <>
              <strong>Instruções:</strong> Clique nas células de valor ou meta
              para editá-las. Use o botão de bloqueio para impedir que outros
              usuários editem métricas específicas. Apenas administradores podem
              desbloquear métricas bloqueadas por outros usuários.
            </>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
