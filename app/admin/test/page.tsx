"use client";

import React from "react";

export default function AdminTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
      <p className="text-gray-600">
        If you can see this, admin routing is working!
      </p>
      <div className="mt-4 p-4 bg-green-100 rounded">
        <p className="text-green-800">✅ Admin page loaded successfully</p>
      </div>
    </div>
  );
}
