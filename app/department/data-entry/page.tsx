"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DepartmentDataEntry() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the forms listing page
    router.replace("/department/data-entry/index");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to forms...</p>
      </div>
    </div>
  );
}
