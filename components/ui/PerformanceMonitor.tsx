"use client";

import { useEffect, useState } from "react";

interface PerformanceMetrics {
  pageLoadTime: number;
  authLoadTime: number;
  dataLoadTime: number;
  totalLoadTime: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === "development") {
      setIsVisible(true);
    }

    const startTime = performance.now();
    let authStartTime = 0;
    let dataStartTime = 0;

    // Monitor auth loading
    const authObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes("auth") || entry.name.includes("profile")) {
          authStartTime = entry.startTime;
          break;
        }
      }
    });

    // Monitor data loading
    const dataObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes("supabase") || entry.name.includes("fetch")) {
          dataStartTime = entry.startTime;
          break;
        }
      }
    });

    try {
      authObserver.observe({ entryTypes: ["measure"] });
      dataObserver.observe({ entryTypes: ["measure"] });
    } catch (e) {
      // PerformanceObserver not supported
    }

    // Calculate metrics after a delay
    setTimeout(() => {
      const endTime = performance.now();
      const pageLoadTime = endTime - startTime;

      setMetrics({
        pageLoadTime: Math.round(pageLoadTime),
        authLoadTime: authStartTime ? Math.round(authStartTime) : 0,
        dataLoadTime: dataStartTime ? Math.round(dataStartTime) : 0,
        totalLoadTime: Math.round(pageLoadTime),
      });
    }, 1000);

    return () => {
      authObserver.disconnect();
      dataObserver.disconnect();
    };
  }, []);

  if (!isVisible || !metrics) return null;

  const getColor = (time: number) => {
    if (time < 1000) return "text-green-600";
    if (time < 3000) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs z-50">
      <div className="font-semibold mb-2">Performance Monitor</div>
      <div className="space-y-1">
        <div className={`${getColor(metrics.pageLoadTime)}`}>
          Page Load: {metrics.pageLoadTime}ms
        </div>
        <div className={`${getColor(metrics.authLoadTime)}`}>
          Auth Load: {metrics.authLoadTime}ms
        </div>
        <div className={`${getColor(metrics.dataLoadTime)}`}>
          Data Load: {metrics.dataLoadTime}ms
        </div>
        <div className={`${getColor(metrics.totalLoadTime)} font-bold`}>
          Total: {metrics.totalLoadTime}ms
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
    </div>
  );
}
