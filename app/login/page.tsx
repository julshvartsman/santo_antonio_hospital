"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/ui/Logo";
import { supabase } from "@/lib/supabaseClient";

import { LoginCredentials } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange", // Enable real-time validation
  });

  useEffect(() => {
    // Clear any invalid session data on login page load
    const clearInvalidSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          // Check if session is valid by trying to get user
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();
          if (error || !user) {
            console.log("Invalid session detected, clearing...");
            await supabase.auth.signOut();
          }
        }
      } catch (error) {
        console.error("Error checking session validity:", error);
        // If there's an error, clear the session anyway
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error("Error signing out:", signOutError);
        }
      }
    };

    clearInvalidSession();
  }, []);

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
      };
      const user = await login(credentials);
      // Redirect based on user role
      if (user.role === "admin" || user.role === "super_admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "department_head") {
        router.push("/department/dashboard");
      } else {
        // Fallback for any other roles - default to department dashboard
        router.push("/department/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Logo */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md">
          <Logo size="lg" className="mb-8" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Hospital Sustainability Dashboard
          </h2>
          <p className="text-gray-600">
            Manage and monitor sustainability metrics across all hospital
            departments
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">
              Enter your email and password to sign in!
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...loginForm} key="login-form">
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                          <Input
                            type="email"
                            placeholder="EMAIL"
                            {...field}
                            className="h-14 pl-12 border-2 border-gray-200 rounded-lg text-sm font-medium placeholder:text-gray-400"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                            </svg>
                          </div>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="PASSWORD"
                            {...field}
                            className="h-14 pl-12 pr-12 border-2 border-gray-200 rounded-lg text-sm font-medium placeholder:text-gray-400"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-[#225384] hover:bg-[#1a4a6b] text-white text-base font-semibold rounded-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <span>Sign In</span>
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <div>
                    <Link
                      href="/forgot-password"
                      className="text-[#225384] text-sm font-medium hover:text-[#1a4a6b] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      href="/signup"
                      className="text-[#225384] font-medium hover:text-[#1a4a6b] transition-colors"
                    >
                      Sign up here
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
