"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import DepartmentLayout from "@/components/layout/DepartmentLayout";
import { useApp } from "@/components/providers/AppProvider";

export default function DepartmentPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { language } = useApp();

  useEffect(() => {
    if (
      !isLoading &&
      (!user ||
        (user.role !== "department_head" && user.role !== "super_admin"))
    ) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#225384] mx-auto"></div>
          <p className="mt-2 text-gray-600">{language.t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (
    !user ||
    (user.role !== "department_head" && user.role !== "super_admin")
  ) {
    return null;
  }

  return <DepartmentLayout>{children}</DepartmentLayout>;
}
