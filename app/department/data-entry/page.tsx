"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Save, Send } from "lucide-react";

export default function DepartmentDataEntry() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Entry</h1>
        <p className="text-gray-600 mt-2">
          Enter your department's sustainability metrics for this month
        </p>
      </div>

      {/* Data Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Monthly Sustainability Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="energy">Energy Usage (kWh)</Label>
              <Input
                id="energy"
                type="number"
                placeholder="Enter energy usage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="water">Water Usage (m³)</Label>
              <Input id="water" type="number" placeholder="Enter water usage" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waste">Waste Generated (kg)</Label>
              <Input
                id="waste"
                type="number"
                placeholder="Enter waste amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recycling">Recycling Rate (%)</Label>
              <Input
                id="recycling"
                type="number"
                placeholder="Enter recycling rate"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <textarea
              id="notes"
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={4}
              placeholder="Any additional notes or observations..."
            />
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save Draft</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Submit Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
