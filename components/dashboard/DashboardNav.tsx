"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, LogOut, Settings } from "lucide-react";

export function DashboardNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isAdmin = user?.role === "admin";
  const isDepartmentHead = user?.role === "department_head";

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#225384] to-[#1a4a6b] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#225384]">
                  Santo António
                </h1>
                <p className="text-xs text-gray-500">
                  Centro Hospitalar Universitário
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-2">
              {isAdmin && (
                <Button
                  variant={
                    pathname === "/admin/dashboard" ? "default" : "ghost"
                  }
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                    pathname === "/admin/dashboard"
                      ? "bg-[#225384] text-white shadow-sm"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => router.push("/admin/dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              )}

              {isDepartmentHead && (
                <Button
                  variant={
                    pathname === "/department/dashboard" ? "default" : "ghost"
                  }
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                    pathname === "/department/dashboard"
                      ? "bg-[#225384] text-white shadow-sm"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => router.push("/department/dashboard")}
                >
                  <LineChart className="h-4 w-4 mr-2" />
                  Department Dashboard
                </Button>
              )}
            </nav>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-4">
            {/* Settings (Admin only) */}
            {isAdmin && (
              <Button
                variant="ghost"
                className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600"
                onClick={() => router.push("/admin/settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50">
                <div className="w-8 h-8 bg-[#225384] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isAdmin ? "Director's Page" : "Department Head"}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              className="flex items-center px-3 py-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
