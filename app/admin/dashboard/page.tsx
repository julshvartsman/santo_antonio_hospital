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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { supabase } from "@/lib/supabaseClient";
import { assignHospitalToUser } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  hospital_id: string | null;
  created_at: string;
}

interface Hospital {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const { language } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    fetchUsersAndHospitals();
  }, []);

  const fetchUsersAndHospitals = async () => {
    try {
      setLoading(true);
      
      // Fetch users without hospital_id
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .is('hospital_id', null)
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      // Fetch all hospitals
      const { data: hospitalsData, error: hospitalsError } = await supabase
        .from('hospitals')
        .select('*')
        .order('name');

      if (hospitalsError) {
        console.error('Error fetching hospitals:', hospitalsError);
        return;
      }

      setUsers(usersData || []);
      setHospitals(hospitalsData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignHospital = async (userId: string, hospitalName: string) => {
    try {
      setAssigning(userId);
      const success = await assignHospitalToUser(userId, hospitalName);
      
      if (success) {
        // Refresh the users list
        await fetchUsersAndHospitals();
      }
    } catch (error) {
      console.error('Error assigning hospital:', error);
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {language.t("dashboard.admin")}
        </h1>
        <p className="text-gray-600 mt-2">{language.t("dashboard.manage")}</p>
      </div>

      {/* Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>15 Days Left Until Monthly Report Due</span>
          <Button variant="outline" size="sm">
            Notify Team
          </Button>
        </AlertDescription>
      </Alert>

      {/* User Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management - Hospital Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#225384] mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">All users have been assigned to hospitals!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Assign Hospital</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          onValueChange={(value) => handleAssignHospital(user.id, value)}
                          disabled={assigning === user.id}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select hospital" />
                          </SelectTrigger>
                          <SelectContent>
                            {hospitals.map((hospital) => (
                              <SelectItem key={hospital.id} value={hospital.name}>
                                {hospital.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {assigning === user.id && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#225384]"></div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Cumulative Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#225384]/10 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#225384]">Total kWh</p>
                  <p className="text-2xl font-bold text-[#225384]">
                    1,234,567 kWh
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#225384]" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Total m³</p>
                  <p className="text-2xl font-bold text-green-900">89,123</p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Total CO₂</p>
                  <p className="text-2xl font-bold text-orange-900">456,789</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Hospitals Trends */}
      <Card>
        <CardHeader>
          <CardTitle>All Hospitals Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Multi-line chart placeholder</p>
          </div>
        </CardContent>
      </Card>

      {/* Sparkline Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={i % 2 === 0 ? "default" : "secondary"}>
                  Hospital {i + 1}
                </Badge>
                <span className="text-xs text-gray-500">
                  +{Math.floor(Math.random() * 20)}%
                </span>
              </div>
              <div className="h-16 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-xs text-gray-500">Sparkline</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submission Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submission Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hospital</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Central Hospital</TableCell>
                <TableCell>Emergency</TableCell>
                <TableCell>
                  <Badge variant="default">Submitted</Badge>
                </TableCell>
                <TableCell>2024-01-15</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>North Medical Center</TableCell>
                <TableCell>Surgery</TableCell>
                <TableCell>
                  <Badge variant="secondary">Pending</Badge>
                </TableCell>
                <TableCell>2024-01-14</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>South General</TableCell>
                <TableCell>Cardiology</TableCell>
                <TableCell>
                  <Badge variant="destructive">Overdue</Badge>
                </TableCell>
                <TableCell>2024-01-10</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
