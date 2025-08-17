"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Edit, Plus, Settings } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useHospitalVariables } from "@/hooks/useHospitalVariables";
import { useApp } from "@/components/providers/AppProvider";

interface Hospital {
  id: string;
  name: string;
  location: string;
}

export default function HospitalVariablesPage() {
  const { language } = useApp();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<any>(null);
  const [newVariable, setNewVariable] = useState({
    variable_name: "",
    variable_value: "",
    variable_type: "number",
    description: "",
  });

  const {
    variables,
    loading,
    error,
    addVariable,
    updateVariable,
    deleteVariable,
    refresh,
  } = useHospitalVariables(selectedHospital);

  // Fetch hospitals on component mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .order("name");

      if (error) throw error;
      setHospitals(data || []);
    } catch (err) {
      console.error("Error fetching hospitals:", err);
    }
  };

  const handleAddVariable = async () => {
    if (!selectedHospital || !newVariable.variable_name) return;

    try {
      await addVariable({
        hospital_id: selectedHospital,
        ...newVariable,
        variable_value: parseVariableValue(
          newVariable.variable_value,
          newVariable.variable_type
        ),
      });

      // Reset form
      setNewVariable({
        variable_name: "",
        variable_value: "",
        variable_type: "number",
        description: "",
      });
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error("Error adding variable:", err);
    }
  };

  const handleEditVariable = async () => {
    if (!editingVariable) return;

    try {
      await updateVariable(editingVariable.id, {
        variable_name: editingVariable.variable_name,
        variable_value: parseVariableValue(
          editingVariable.variable_value,
          editingVariable.variable_type
        ),
        variable_type: editingVariable.variable_type,
        description: editingVariable.description,
      });

      setIsEditDialogOpen(false);
      setEditingVariable(null);
    } catch (err) {
      console.error("Error updating variable:", err);
    }
  };

  const handleDeleteVariable = async (variableId: string) => {
    if (confirm("Are you sure you want to delete this variable?")) {
      try {
        await deleteVariable(variableId);
      } catch (err) {
        console.error("Error deleting variable:", err);
      }
    }
  };

  const parseVariableValue = (value: string, type: string) => {
    switch (type) {
      case "number":
        return parseFloat(value) || 0;
      case "boolean":
        return value === "true";
      case "json":
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  };

  const formatVariableValue = (value: any, type: string) => {
    switch (type) {
      case "boolean":
        return value ? "true" : "false";
      case "json":
        return JSON.stringify(value, null, 2);
      default:
        return String(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hospital Variables
          </h1>
          <p className="text-gray-600 mt-2">
            Configure custom variables and settings for each hospital
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">Admin Only</span>
        </div>
      </div>

      {/* Hospital Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Hospital</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedHospital} onValueChange={setSelectedHospital}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose a hospital to configure" />
            </SelectTrigger>
            <SelectContent>
              {hospitals.map((hospital) => (
                <SelectItem key={hospital.id} value={hospital.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{hospital.name}</span>
                    <span className="text-sm text-gray-500">
                      {hospital.location}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Variables Management */}
      {selectedHospital && (
        <>
          {/* Add Variable Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Variables for{" "}
              {hospitals.find((h) => h.id === selectedHospital)?.name}
            </h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Variable</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Variable</DialogTitle>
                  <DialogDescription>
                    Create a new variable for this hospital. Variables can be
                    used in forms and calculations.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="variable-name">Variable Name</Label>
                    <Input
                      id="variable-name"
                      value={newVariable.variable_name}
                      onChange={(e) =>
                        setNewVariable({
                          ...newVariable,
                          variable_name: e.target.value,
                        })
                      }
                      placeholder="e.g., energy_target_kwh"
                    />
                  </div>
                  <div>
                    <Label htmlFor="variable-type">Type</Label>
                    <Select
                      value={newVariable.variable_type}
                      onValueChange={(value) =>
                        setNewVariable({ ...newVariable, variable_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="variable-value">Value</Label>
                    <Input
                      id="variable-value"
                      value={newVariable.variable_value}
                      onChange={(e) =>
                        setNewVariable({
                          ...newVariable,
                          variable_value: e.target.value,
                        })
                      }
                      placeholder="Enter value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="variable-description">Description</Label>
                    <Textarea
                      id="variable-description"
                      value={newVariable.description}
                      onChange={(e) =>
                        setNewVariable({
                          ...newVariable,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe what this variable is used for"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddVariable}>Add Variable</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Variables List */}
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading variables...</p>
                </div>
              ) : variables.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No variables configured
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This hospital doesn't have any custom variables yet.
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    Add First Variable
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {variables.map((variable) => (
                    <div
                      key={variable.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">
                            {variable.variable_name}
                          </h3>
                          <Badge variant="secondary">
                            {variable.variable_type}
                          </Badge>
                        </div>
                        {variable.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {variable.description}
                          </p>
                        )}
                        <div className="text-sm">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {formatVariableValue(
                              variable.variable_value,
                              variable.variable_type
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog
                          open={isEditDialogOpen}
                          onOpenChange={setIsEditDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingVariable({
                                  ...variable,
                                  variable_value: formatVariableValue(
                                    variable.variable_value,
                                    variable.variable_type
                                  ),
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Variable</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Variable Name</Label>
                                <Input
                                  value={editingVariable?.variable_name || ""}
                                  onChange={(e) =>
                                    setEditingVariable({
                                      ...editingVariable,
                                      variable_name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Type</Label>
                                <Select
                                  value={
                                    editingVariable?.variable_type || "text"
                                  }
                                  onValueChange={(value) =>
                                    setEditingVariable({
                                      ...editingVariable,
                                      variable_type: value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="number">
                                      Number
                                    </SelectItem>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="boolean">
                                      Boolean
                                    </SelectItem>
                                    <SelectItem value="json">JSON</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Value</Label>
                                <Input
                                  value={editingVariable?.variable_value || ""}
                                  onChange={(e) =>
                                    setEditingVariable({
                                      ...editingVariable,
                                      variable_value: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Textarea
                                  value={editingVariable?.description || ""}
                                  onChange={(e) =>
                                    setEditingVariable({
                                      ...editingVariable,
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleEditVariable}>
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVariable(variable.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
