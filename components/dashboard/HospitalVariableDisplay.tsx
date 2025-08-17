import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHospitalVariables } from "@/hooks/useHospitalVariables";
import { Settings } from "lucide-react";

interface HospitalVariableDisplayProps {
  hospitalId: string;
  title?: string;
}

export default function HospitalVariableDisplay({
  hospitalId,
  title = "Hospital Configuration",
}: HospitalVariableDisplayProps) {
  const { variables, loading, error } = useHospitalVariables(hospitalId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">
              Loading configuration...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-red-600">Error loading configuration</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variables.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              No configuration variables set
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatVariableValue = (value: any, type: string) => {
    switch (type) {
      case "boolean":
        return value ? "Enabled" : "Disabled";
      case "json":
        return Array.isArray(value) ? value.join(", ") : JSON.stringify(value);
      default:
        return String(value);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {variables.map((variable) => (
            <div
              key={variable.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-sm">
                    {variable.variable_name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {variable.variable_type}
                  </Badge>
                </div>
                {variable.description && (
                  <p className="text-xs text-gray-600 mb-2">
                    {variable.description}
                  </p>
                )}
                <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                  {formatVariableValue(
                    variable.variable_value,
                    variable.variable_type
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
