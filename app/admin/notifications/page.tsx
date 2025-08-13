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
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const { language } = useApp();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({ scope: "all" });

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
              <Badge variant="secondary">{unreadCount}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8">Loading…</div>
            ) : error ? (
              <div className="py-8 text-red-700">{error}</div>
            ) : (
              <div className="space-y-3">
                {notifications
                  .filter((n) => !n.isRead)
                  .map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {n.type === "success" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : n.type === "warning" ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        ) : n.type === "error" ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            {n.title}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {n.message}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(n.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                {unreadCount > 0 && (
                  <div>
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                      Mark all as read
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Notifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8">Loading…</div>
            ) : error ? (
              <div className="py-8 text-red-700">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {n.type === "success" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : n.type === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          ) : n.type === "error" ? (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="text-sm capitalize">{n.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{n.title}</TableCell>
                      <TableCell className="text-gray-600">
                        {n.message}
                      </TableCell>
                      <TableCell>
                        {new Date(n.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={n.isRead ? "secondary" : "destructive"}>
                          {n.isRead ? "Read" : "Unread"}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        {!n.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(n.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(n.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
