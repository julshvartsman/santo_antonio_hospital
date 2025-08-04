"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function DepartmentReports() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">
          View and analyze your department's sustainability reports
        </p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Monthly Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant="default">Completed</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Period</span>
                <span className="text-sm">January 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Submitted</span>
                <span className="text-sm">Jan 15, 2024</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Trend Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Energy Trend</span>
                <div className="flex items-center text-green-600">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span className="text-sm">-12%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Water Trend</span>
                <div className="flex items-center text-green-600">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span className="text-sm">-8%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Waste Trend</span>
                <div className="flex items-center text-red-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+5%</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Next Report</span>
                <Badge variant="secondary">Due Soon</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Due Date</span>
                <span className="text-sm">Feb 15, 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Days Left</span>
                <span className="text-sm text-orange-600 font-medium">12</span>
              </div>
              <Button size="sm" className="w-full">
                Start Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Period</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Submitted</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">January 2024</td>
                  <td className="py-2">
                    <Badge variant="default">Completed</Badge>
                  </td>
                  <td className="py-2">Jan 15, 2024</td>
                  <td className="py-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">December 2023</td>
                  <td className="py-2">
                    <Badge variant="default">Completed</Badge>
                  </td>
                  <td className="py-2">Dec 18, 2023</td>
                  <td className="py-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">November 2023</td>
                  <td className="py-2">
                    <Badge variant="default">Completed</Badge>
                  </td>
                  <td className="py-2">Nov 20, 2023</td>
                  <td className="py-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
