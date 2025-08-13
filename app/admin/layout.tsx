"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/components/providers/AppProvider";
import AdminLayout from "@/components/layout/AdminLayout";

export default function AdminPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const { language } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (
      !isLoading &&
      (!user || (user.role !== "admin" && user.role !== "super_admin"))
    ) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#225384] mx-auto"></div>
          <p className="mt-2 text-gray-600">
            {language.t("admin.common.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
