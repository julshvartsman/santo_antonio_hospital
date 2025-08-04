"use client";

import React from "react";

export default function SimpleAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Simple Admin Page
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
          <p className="text-gray-600 mb-4">
            This is a simple admin page without the complex layout components.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#225384]/10 p-4 rounded-lg">
              <h3 className="font-semibold text-[#225384]">Total kWh</h3>
              <p className="text-2xl font-bold text-[#225384]">1,234,567</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Total m³</h3>
              <p className="text-2xl font-bold text-green-600">89,123</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900">Total CO₂</h3>
              <p className="text-2xl font-bold text-orange-600">456,789</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
