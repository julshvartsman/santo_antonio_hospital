"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Droplets,
  Zap,
  Recycle,
  Clock,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useApp } from "@/components/providers/AppProvider";
import { generateMockReports } from "@/utils/mockData";
import { getDaysUntil, isOverdue, formatDate } from "@/lib/utils";
import { MonthlyReport } from "@/types";

export default function DashboardPage() {
  const { language } = useApp();
  const [reports] = useState<MonthlyReport[]>(() => generateMockReports());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Get the next due report
  const nextDueReport = reports.find((r) => !r.isCompleted);
  const daysUntilDue = nextDueReport
    ? getDaysUntil(nextDueReport.dueDate)
    : null;
  const isDue = nextDueReport ? isOverdue(nextDueReport.dueDate) : false;

  // Mock metrics for dashboard cards
  const metrics = [
    {
      title: "Energy Consumption",
      value: "2,847 kWh",
      change: -12.5,
      trend: "down",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Water Usage",
      value: "1,234 m³",
      change: -8.2,
      trend: "down",
      icon: Droplets,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Waste Generated",
      value: "456 kg",
      change: 5.3,
      trend: "up",
      icon: Recycle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "CO₂ Emissions",
      value: "1.2 tons",
      change: -15.7,
      trend: "down",
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const handleNotifyTeam = () => {
    // Mock WhatsApp integration
    const message = encodeURIComponent(
      `Olá Sr. Silva, precisamos de ajuda com o relatório de sustentabilidade que vence em ${daysUntilDue} ${
        daysUntilDue === 1 ? "dia" : "dias"
      }.`
    );
    const phone = "+5511999999999"; // Mock phone number
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Due Date Notification Banner */}
      {nextDueReport && (
        <Alert
          variant={
            isDue
              ? "destructive"
              : daysUntilDue && daysUntilDue <= 3
              ? "warning"
              : "info"
          }
          className="border-l-4"
        >
          <Clock className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            <span>{isDue ? "Overdue" : `${daysUntilDue} days until due`}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNotifyTeam}
              className="ml-4"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Notify Team
            </Button>
          </AlertTitle>
          <AlertDescription>
            {language.language === "en" ? (
              <>
                Monthly sustainability report for{" "}
                {formatDate(
                  new Date(nextDueReport.year, nextDueReport.month - 1)
                )}
                {isDue
                  ? " is overdue"
                  : ` is due on ${formatDate(nextDueReport.dueDate)}`}
                .
              </>
            ) : (
              <>
                Relatório mensal de sustentabilidade para{" "}
                {formatDate(
                  new Date(nextDueReport.year, nextDueReport.month - 1)
                )}
                {isDue
                  ? " está atrasado"
                  : ` vence em ${formatDate(nextDueReport.dueDate)}`}
                .
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          {language.language === "en"
            ? "Monitor your hospital's sustainability metrics and progress."
            : "Monitore as métricas de sustentabilidade e progresso do seu hospital."}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive =
            metric.trend === "down" && metric.title !== "Waste Generated";

          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </div>
                <div className="flex items-center mt-2">
                  {isPositive ? (
                    <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {Math.abs(metric.change)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    {language.language === "en"
                      ? "vs last month"
                      : "vs mês anterior"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {language.language === "en"
                ? "Recent Reports"
                : "Relatórios Recentes"}
            </CardTitle>
            <CardDescription>
              {language.language === "en"
                ? "Status of monthly sustainability reports"
                : "Status dos relatórios mensais de sustentabilidade"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.slice(0, 3).map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(
                        report.year,
                        report.month - 1
                      ).toLocaleDateString(
                        language.language === "en" ? "en-US" : "pt-BR",
                        { month: "long", year: "numeric" }
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {language.language === "en" ? "Due:" : "Vencimento:"}{" "}
                      {formatDate(report.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {report.isCompleted ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {language.language === "en" ? "Completed" : "Concluído"}
                      </span>
                    ) : isOverdue(report.dueDate) ? (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {language.language === "en" ? "Overdue" : "Atrasado"}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        {language.language === "en" ? "Pending" : "Pendente"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language.language === "en" ? "Quick Actions" : "Ações Rápidas"}
            </CardTitle>
            <CardDescription>
              {language.language === "en"
                ? "Common tasks and shortcuts"
                : "Tarefas comuns e atalhos"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/data-entry">
                <Activity className="h-4 w-4 mr-2" />
                {language.language === "en"
                  ? "Enter Monthly Data"
                  : "Inserir Dados Mensais"}
              </a>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/analytics">
                <TrendingUp className="h-4 w-4 mr-2" />
                {language.language === "en"
                  ? "View Analytics"
                  : "Ver Analíticas"}
              </a>
            </Button>

            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleNotifyTeam}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Mr. Silva
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* TO-DO Features Placeholder */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {language.language === "en"
              ? "Upcoming Features"
              : "Recursos Futuros"}
          </h3>
          <p className="text-gray-600 mb-4">
            {language.language === "en"
              ? "The following features will be implemented in future iterations:"
              : "Os seguintes recursos serão implementados em iterações futuras:"}
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>
              •{" "}
              {language.language === "en"
                ? "Onboarding flow and video tutorial"
                : "Fluxo de integração e tutorial em vídeo"}
            </li>
            <li>
              •{" "}
              {language.language === "en"
                ? "Auto-populate forms from email parsing"
                : "Preenchimento automático via análise de email"}
            </li>
            <li>
              •{" "}
              {language.language === "en"
                ? "Advanced CO₂ calculator modal"
                : "Calculadora avançada de CO₂"}
            </li>
            <li>
              •{" "}
              {language.language === "en"
                ? "Admin metrics panel"
                : "Painel de métricas do administrador"}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
