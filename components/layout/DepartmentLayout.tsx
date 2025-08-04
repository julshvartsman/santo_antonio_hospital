"use client";

import React, { ReactNode } from "react";
import DepartmentSidebar from "./DepartmentSidebar";
import DepartmentHeader from "./DepartmentHeader";

interface DepartmentLayoutProps {
  children: ReactNode;
}

export default function DepartmentLayout({ children }: DepartmentLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <DepartmentSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DepartmentHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
