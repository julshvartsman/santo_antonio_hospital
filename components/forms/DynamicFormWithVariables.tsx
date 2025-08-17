import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useHospitalVariables } from "@/hooks/useHospitalVariables";

interface DynamicFormWithVariablesProps {
  hospitalId: string;
  formData: Record<string, number>;
  onFormDataChange: (data: Record<string, number>) => void;
}

export default function DynamicFormWithVariables({
  hospitalId,
  formData,
  onFormDataChange,
}: DynamicFormWithVariablesProps) {
  const { variables, getVariableValue } = useHospitalVariables(hospitalId);
  const [targets, setTargets] = useState<Record<string, number>>({});

  // Load targets from hospital variables
  useEffect(() => {
    const energyTarget = getVariableValue("energy_target_kwh");
    const waterTarget = getVariableValue("water_target_m3");

    setTargets({
      energy_target_kwh: typeof energyTarget === "number" ? energyTarget : 0,
      water_target_m3: typeof waterTarget === "number" ? waterTarget : 0,
    });
  }, [variables, getVariableValue]);

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    onFormDataChange({
      ...formData,
      [field]: numValue,
    });
  };

  const getProgressPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 80) return "text-green-600";
    if (percentage <= 100) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Energy Usage Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Energy Usage (kWh)</span>
            {targets.energy_target_kwh > 0 && (
              <Badge variant="outline">
                Target: {targets.energy_target_kwh.toLocaleString()} kWh
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="kwh_usage">Current Usage</Label>
              <Input
                id="kwh_usage"
                type="number"
                value={formData.kwh_usage || ""}
                onChange={(e) => handleInputChange("kwh_usage", e.target.value)}
                placeholder="Enter kWh usage"
              />
            </div>

            {targets.energy_target_kwh > 0 && formData.kwh_usage > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span
                    className={getProgressColor(
                      getProgressPercentage(
                        formData.kwh_usage,
                        targets.energy_target_kwh
                      )
                    )}
                  >
                    {getProgressPercentage(
                      formData.kwh_usage,
                      targets.energy_target_kwh
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      getProgressPercentage(
                        formData.kwh_usage,
                        targets.energy_target_kwh
                      ) <= 80
                        ? "bg-green-500"
                        : getProgressPercentage(
                            formData.kwh_usage,
                            targets.energy_target_kwh
                          ) <= 100
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        getProgressPercentage(
                          formData.kwh_usage,
                          targets.energy_target_kwh
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-600">
                  {formData.kwh_usage > targets.energy_target_kwh
                    ? `${(
                        formData.kwh_usage - targets.energy_target_kwh
                      ).toLocaleString()} kWh over target`
                    : `${(
                        targets.energy_target_kwh - formData.kwh_usage
                      ).toLocaleString()} kWh remaining to target`}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Water Usage Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Water Usage (m³)</span>
            {targets.water_target_m3 > 0 && (
              <Badge variant="outline">
                Target: {targets.water_target_m3.toLocaleString()} m³
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="water_usage_m3">Current Usage</Label>
              <Input
                id="water_usage_m3"
                type="number"
                value={formData.water_usage_m3 || ""}
                onChange={(e) =>
                  handleInputChange("water_usage_m3", e.target.value)
                }
                placeholder="Enter water usage in m³"
              />
            </div>

            {targets.water_target_m3 > 0 && formData.water_usage_m3 > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span
                    className={getProgressColor(
                      getProgressPercentage(
                        formData.water_usage_m3,
                        targets.water_target_m3
                      )
                    )}
                  >
                    {getProgressPercentage(
                      formData.water_usage_m3,
                      targets.water_target_m3
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      getProgressPercentage(
                        formData.water_usage_m3,
                        targets.water_target_m3
                      ) <= 80
                        ? "bg-green-500"
                        : getProgressPercentage(
                            formData.water_usage_m3,
                            targets.water_target_m3
                          ) <= 100
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        getProgressPercentage(
                          formData.water_usage_m3,
                          targets.water_target_m3
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-600">
                  {formData.water_usage_m3 > targets.water_target_m3
                    ? `${(
                        formData.water_usage_m3 - targets.water_target_m3
                      ).toLocaleString()} m³ over target`
                    : `${(
                        targets.water_target_m3 - formData.water_usage_m3
                      ).toLocaleString()} m³ remaining to target`}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Info */}
      {variables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">
              Active Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500">
              This form uses {variables.length} configuration variable
              {variables.length !== 1 ? "s" : ""} set by your administrator.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
