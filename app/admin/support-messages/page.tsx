"use client";

import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  User,
  Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface SupportMessage {
  id: string;
  from_name: string;
  from_email: string;
  from_phone: string | null;
  message: string;
  user_id: string | null;
  status: "pending" | "in_progress" | "resolved" | "closed";
  admin_response: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function SupportMessagesPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(
    null
  );
  const [responseText, setResponseText] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    fetchSupportMessages();
  }, []);

  const fetchSupportMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (
    messageId: string,
    status: SupportMessage["status"],
    response?: string
  ) => {
    try {
      setIsResponding(true);
      const updateData: any = { status };

      if (response) {
        updateData.admin_response = response;
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("support_messages")
        .update(updateData)
        .eq("id", messageId);

      if (error) throw error;

      // Refresh messages
      await fetchSupportMessages();
      setSelectedMessage(null);
      setResponseText("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsResponding(false);
    }
  };

  const getStatusBadge = (status: SupportMessage["status"]) => {
    const variants = {
      pending: "destructive",
      in_progress: "secondary",
      resolved: "default",
      closed: "outline",
    } as const;

    const colors = {
      pending: "bg-red-100 text-red-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={colors[status]}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getStatusIcon = (status: SupportMessage["status"]) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "closed":
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading support messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading support messages: {error}
          </AlertDescription>
        </Alert>
        <Button onClick={fetchSupportMessages}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support Messages</h1>
        <p className="text-gray-600 mt-2">
          View and respond to support requests from department heads
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  {messages.filter((m) => m.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">
                  {messages.filter((m) => m.status === "in_progress").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">
                  {messages.filter((m) => m.status === "resolved").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No support messages found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{message.from_name}</div>
                        <div className="text-sm text-gray-500 flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{message.from_email}</span>
                        </div>
                        {message.from_phone && (
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{message.from_phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm line-clamp-2">
                          {message.message}
                        </p>
                        {message.admin_response && (
                          <p className="text-xs text-gray-500 mt-1">
                            Response: {message.admin_response.substring(0, 50)}
                            ...
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(message.status)}
                        {getStatusBadge(message.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedMessage(message)}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Support Message Details</DialogTitle>
                              <DialogDescription>
                                Message from {message.from_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">
                                  Original Message:
                                </h4>
                                <p className="text-sm">{message.message}</p>
                              </div>

                              {message.admin_response && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <h4 className="font-medium mb-2">
                                    Admin Response:
                                  </h4>
                                  <p className="text-sm">
                                    {message.admin_response}
                                  </p>
                                </div>
                              )}

                              {message.status === "pending" && (
                                <div className="space-y-2">
                                  <h4 className="font-medium">
                                    Respond to this message:
                                  </h4>
                                  <Textarea
                                    placeholder="Type your response..."
                                    value={responseText}
                                    onChange={(e) =>
                                      setResponseText(e.target.value)
                                    }
                                    rows={4}
                                  />
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() =>
                                        updateMessageStatus(
                                          message.id,
                                          "resolved",
                                          responseText
                                        )
                                      }
                                      disabled={
                                        !responseText.trim() || isResponding
                                      }
                                    >
                                      {isResponding
                                        ? "Sending..."
                                        : "Resolve & Respond"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        updateMessageStatus(
                                          message.id,
                                          "in_progress"
                                        )
                                      }
                                      disabled={isResponding}
                                    >
                                      Mark In Progress
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {message.status === "in_progress" && (
                                <div className="space-y-2">
                                  <h4 className="font-medium">Add response:</h4>
                                  <Textarea
                                    placeholder="Type your response..."
                                    value={responseText}
                                    onChange={(e) =>
                                      setResponseText(e.target.value)
                                    }
                                    rows={4}
                                  />
                                  <Button
                                    onClick={() =>
                                      updateMessageStatus(
                                        message.id,
                                        "resolved",
                                        responseText
                                      )
                                    }
                                    disabled={
                                      !responseText.trim() || isResponding
                                    }
                                  >
                                    {isResponding
                                      ? "Sending..."
                                      : "Resolve & Respond"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
