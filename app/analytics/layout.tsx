"use client";

import React from "react";
import { AppProvider } from "@/components/providers/AppProvider";
import { Navigation } from "@/components/layout/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <ProtectedRoute>
        <Navigation>{children}</Navigation>
      </ProtectedRoute>
    </AppProvider>
  );
}
