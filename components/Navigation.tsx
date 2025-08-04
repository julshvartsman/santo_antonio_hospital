"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/ui/Logo";
import {
  LayoutDashboard,
  Building2,
  LogOut,
  User,
  TestTube2,
} from "lucide-react";

export default function Navigation() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  // Hide navigation on auth pages and dashboard pages to avoid duplication
  const isOnAuthPage =
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/signup";
  const isOnDashboardPage =
    pathname.startsWith("/admin/") || pathname.startsWith("/department/");

  if (isOnAuthPage || isOnDashboardPage) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Logo size="sm" />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {user.role === "admin" && (
              <Link href="/admin/dashboard">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Button>
              </Link>
            )}

            {user.role === "department_head" && (
              <Link href="/department/dashboard">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Department Dashboard</span>
                </Button>
              </Link>
            )}

            {/* Test Form Link */}
            <Link href="/test-form">
              <Button variant="ghost" className="flex items-center space-x-2">
                <TestTube2 className="h-4 w-4" />
                <span>Test Form</span>
              </Button>
            </Link>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {user.role === "admin" ? "Admin" : "Department Head"}
              </span>
            </div>

            {/* Logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
