"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
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

  // Show loading state for first 1 second, then show redirecting message (reduced from 2 seconds)
  const [showRedirecting, setShowRedirecting] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowRedirecting(true), 1000); // Reduced from 2000ms
    return () => clearTimeout(timer);
  }, []);

  // Memoize loading state to prevent unnecessary re-renders
  const loadingState = useMemo(() => {
    if (!mounted || isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Logo size="xl" className="mb-8" />
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#225384] mx-auto mb-4"></div>
            <p className="text-gray-600">
              {showRedirecting ? "Checking authentication..." : "Loading..."}
            </p>
          </div>
        </div>
      );
    }
    return null;
  }, [mounted, isLoading, showRedirecting]);

  // Memoize unauthenticated state
  const unauthenticatedState = useMemo(() => {
    if (!user && !isLoading && mounted) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <Logo size="lg" className="mx-auto mb-6" />
              <CardTitle className="text-3xl font-bold text-gray-900">
                Hospital Sustainability Dashboard
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 mt-2">
                Manage and monitor sustainability metrics across all hospital departments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => router.push("/login")} className="w-full text-lg py-3">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return null;
  }, [user, isLoading, mounted, router]);

  // Memoize authenticated state
  const authenticatedState = useMemo(() => {
    if (user && mounted && !isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Logo size="xl" className="mb-8" />
            <h1 className="text-3xl font-bold mb-4 text-gray-900">
              Hospital Sustainability Dashboard
            </h1>
            <p className="text-lg text-gray-600">Redirecting to your dashboard...</p>
          </div>
        </div>
      );
    }
    return null;
  }, [user, mounted, isLoading]);

  // Return the appropriate state
  if (loadingState) return loadingState;
  if (unauthenticatedState) return unauthenticatedState;
  if (authenticatedState) return authenticatedState;

  // Fallback loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Logo size="xl" className="mb-8" />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#225384] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
