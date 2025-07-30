"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Database,
  Building2,
  Languages,
  LogOut,
  Menu,
  Settings,
  User,
  X,
  Bell,
  HelpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useApp } from "@/components/providers/AppProvider";
import { FloatingHelp } from "@/components/support/FloatingHelp";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "nav.dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "nav.dataEntry", href: "/data-entry", icon: Database },
  { name: "nav.analytics", href: "/analytics", icon: Calendar },
  { name: "nav.settings", href: "/settings", icon: Settings },
];

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const pathname = usePathname();
  const { auth, language } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleLanguage = () => {
    language.setLanguage(language.language === "en" ? "pt" : "en");
  };

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">CityX Hospital</h1>
                <p className="text-xs text-muted-foreground">Sustainability</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{language.t(item.name)}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          {auth.user && (
            <div className="p-4 border-t">
              <Card className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {auth.user.avatar ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={auth.user.avatar}
                        alt={auth.user.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {auth.user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {auth.user.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 justify-start"
                  onClick={auth.logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {language.t("auth.logout")}
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden lg:block">
              <h2 className="text-xl font-semibold text-gray-900">
                {language.t("nav.dashboard")}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="flex items-center space-x-2">
              <Languages className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">EN</span>
              <Switch
                checked={language.language === "pt"}
                onCheckedChange={toggleLanguage}
                className="data-[state=checked]:bg-green-600"
              />
              <span className="text-sm text-gray-600">PT</span>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>

            {/* Help */}
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>

      {/* Floating Help Component */}
      <FloatingHelp />
    </div>
  );
}
