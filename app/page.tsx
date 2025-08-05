"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/components/ui/Logo";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize the redirect logic to prevent unnecessary re-renders
  const handleRedirect = useCallback(() => {
    if (!mounted || isLoading || redirecting) return;

    if (user) {
      setRedirecting(true);
      // Redirect based on user role
      if (user.role === "admin" || user.role === "super_admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "department_head") {
        router.push("/department/dashboard");
      } else {
        // Fallback for any other roles - default to department dashboard
        router.push("/department/dashboard");
      }
    } else if (!isLoading) {
      setRedirecting(true);
      // Redirect to login if not authenticated
      router.push("/login");
    }
  }, [user, isLoading, router, mounted, redirecting]);

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  // Show loading state for first 2 seconds, then show redirecting message
  const [showRedirecting, setShowRedirecting] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowRedirecting(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Always render the same loading state until mounted
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Logo size="lg" className="mb-6" />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#225384] mx-auto mb-4"></div>
          <p className="text-gray-600">
            {showRedirecting ? "Checking authentication..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Logo size="md" className="mx-auto mb-4" />
            <CardTitle className="text-2xl">
              Hospital Sustainability Dashboard
            </CardTitle>
            <CardDescription>
              Please sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => router.push("/login")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Logo size="lg" className="mb-6" />
        <h1 className="text-2xl font-bold mb-4">
          Hospital Sustainability Dashboard
        </h1>
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
