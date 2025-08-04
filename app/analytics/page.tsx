"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calculator,
  Leaf,
  Zap,
  Droplets,
  Recycle,
  AlertTriangle,
  Calendar,
  Target,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/providers/AppProvider";

// Disable static generation for this page
export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  const { auth, language } = useApp();
  const [showCO2Calculator, setShowCO2Calculator] = useState(false);

  // Mock analytics data
  const monthlyTrends = [
    { month: "Jan", energy: 2847, water: 1234, waste: 456, co2: 1.2 },
    { month: "Feb", energy: 2634, water: 1156, waste: 423, co2: 1.1 },
    { month: "Mar", energy: 2489, water: 1089, waste: 445, co2: 1.0 },
  ];

  const categoryEmissions = [
    {
      category: "Energy",
      emissions: 1.2,
      percentage: 45,
      trend: "down",
      change: -12.5,
    },
    {
      category: "Transportation",
      emissions: 0.8,
      percentage: 30,
      trend: "down",
      change: -8.2,
    },
    {
      category: "Waste",
      emissions: 0.4,
      percentage: 15,
      trend: "up",
      change: 5.3,
    },
    {
      category: "Water",
      emissions: 0.3,
      percentage: 10,
      trend: "down",
      change: -15.7,
    },
  ];

  const isAdmin = auth.user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="h-8 w-8 mr-3 text-primary" />
          Analytics
        </h1>
        <p className="text-gray-600 mt-2">
          {language.language === "en"
            ? "Analyze sustainability metrics and track environmental impact."
            : "Analise métricas de sustentabilidade e acompanhe o impacto ambiental."}
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total CO₂ Emissions
            </CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.7 tons</div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">12.5%</span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Energy Efficiency
            </CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">8.2%</span>
              <span className="text-sm text-gray-500 ml-1">improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Water Conservation
            </CardTitle>
            <Droplets className="h-4 w-4 text-[#225384]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,089 m³</div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">15.7%</span>
              <span className="text-sm text-gray-500 ml-1">reduction</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Waste Diversion
            </CardTitle>
            <Recycle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">5.3%</span>
              <span className="text-sm text-gray-500 ml-1">increase</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CO₂ Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              {language.language === "en"
                ? "CO₂ Emissions Calculator"
                : "Calculadora de Emissões CO₂"}
            </span>
            <Button
              onClick={() => setShowCO2Calculator(true)}
              variant="outline"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {language.language === "en"
                ? "Open Calculator"
                : "Abrir Calculadora"}
            </Button>
          </CardTitle>
          <CardDescription>
            {language.language === "en"
              ? "Calculate CO₂ emissions by category and track environmental impact."
              : "Calcule emissões de CO₂ por categoria e acompanhe o impacto ambiental."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryEmissions.map((category, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{category.category}</h4>
                  <span className="text-sm text-gray-500">
                    {category.percentage}%
                  </span>
                </div>
                <div className="text-2xl font-bold mb-2">
                  {category.emissions} tons CO₂
                </div>
                <div className="flex items-center">
                  {category.trend === "down" ? (
                    <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      category.trend === "down"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Math.abs(category.change)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    vs last month
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {language.language === "en"
              ? "Monthly Trends"
              : "Tendências Mensais"}
          </CardTitle>
          <CardDescription>
            {language.language === "en"
              ? "Track sustainability metrics over time."
              : "Acompanhe métricas de sustentabilidade ao longo do tempo."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyTrends.map((trend, index) => (
              <div
                key={index}
                className="grid grid-cols-5 gap-4 p-3 border rounded-lg"
              >
                <div className="font-medium">{trend.month}</div>
                <div className="text-sm">
                  <div className="font-medium">{trend.energy} kWh</div>
                  <div className="text-gray-500">Energy</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">{trend.water} m³</div>
                  <div className="text-gray-500">Water</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">{trend.waste} kg</div>
                  <div className="text-gray-500">Waste</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">{trend.co2} tons</div>
                  <div className="text-gray-500">CO₂</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin-Only Metrics Panel */}
      {isAdmin && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Target className="h-5 w-5 mr-2" />
              {language.language === "en"
                ? "Admin Metrics Panel"
                : "Painel de Métricas do Administrador"}
            </CardTitle>
            <CardDescription>
              {language.language === "en"
                ? "Advanced analytics and system-wide metrics for administrators."
                : "Analíticas avançadas e métricas do sistema para administradores."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#225384]/10 rounded-lg">
                <h4 className="font-medium text-[#225384]">User Activity</h4>
                <div className="text-2xl font-bold text-[#225384]">127</div>
                <p className="text-sm text-[#225384]">
                  Total data entries this month
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">
                  Report Completion
                </h4>
                <div className="text-2xl font-bold text-green-900">98%</div>
                <p className="text-sm text-green-700">
                  On-time submission rate
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900">System Health</h4>
                <div className="text-2xl font-bold text-purple-900">99.9%</div>
                <p className="text-sm text-purple-700">Uptime this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TO-DO Features Placeholder */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {language.language === "en"
              ? "Advanced Analytics Coming Soon"
              : "Analíticas Avançadas em Breve"}
          </h3>
          <p className="text-gray-600 mb-4">
            {language.language === "en"
              ? "The following advanced features will be implemented:"
              : "Os seguintes recursos avançados serão implementados:"}
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>
              •{" "}
              {language.language === "en"
                ? "Interactive charts and visualizations"
                : "Gráficos interativos e visualizações"}
            </li>
            <li>
              •{" "}
              {language.language === "en"
                ? "Predictive analytics and trends"
                : "Análise preditiva e tendências"}
            </li>
            <li>
              •{" "}
              {language.language === "en"
                ? "Detailed CO₂ calculation methodology"
                : "Metodologia detalhada de cálculo de CO₂"}
            </li>
            <li>
              •{" "}
              {language.language === "en"
                ? "Export and reporting features"
                : "Recursos de exportação e relatórios"}
            </li>
            <li>
              •{" "}
              {language.language === "en"
                ? "Goal tracking and benchmarking"
                : "Acompanhamento de metas e benchmarking"}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
