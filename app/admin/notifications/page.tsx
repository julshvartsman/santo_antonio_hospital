"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Bell, CheckCircle, Clock, X } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";

export default function NotificationsPage() {
  const { language } = useApp();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">
          Manage and view all system notifications
        </p>
      </div>

      {/* Notifications Content */}
      <div className="grid gap-6">
        {/* Unread Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Unread Notifications</span>
              <Badge variant="secondary">3</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      High Energy Usage Alert
                    </h4>
                    <span className="text-sm text-gray-500">2 hours ago</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Hospital A has exceeded its daily energy consumption limit
                    by 15%.
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      Monthly Report Generated
                    </h4>
                    <span className="text-sm text-gray-500">1 day ago</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    The sustainability report for March 2024 has been
                    successfully generated.
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      Data Entry Reminder
                    </h4>
                    <span className="text-sm text-gray-500">3 days ago</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Department B has not submitted their weekly sustainability
                    data.
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Notifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Alert</span>
                    </div>
                  </TableCell>
                  <TableCell>High energy usage detected</TableCell>
                  <TableCell>Hospital A</TableCell>
                  <TableCell>2024-03-15 14:30</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Unread</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Mark Read
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Success</span>
                    </div>
                  </TableCell>
                  <TableCell>Monthly report generated successfully</TableCell>
                  <TableCell>All Hospitals</TableCell>
                  <TableCell>2024-03-14 09:15</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Read</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Archive
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Reminder</span>
                    </div>
                  </TableCell>
                  <TableCell>Data entry deadline approaching</TableCell>
                  <TableCell>Hospital B</TableCell>
                  <TableCell>2024-03-12 16:45</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Unread</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Mark Read
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
