"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Logo from "@/components/ui/Logo";
import { supabase } from "@/lib/supabaseClient";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["admin", "department_head"], {
      required_error: "Please select a role",
    }),
    hospital: z.string().min(1, "Hospital name is required"),
    // department: z.string().optional(), // Removed - not in database schema
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "department_head",
      hospital: "",
      // department: "", // Removed - not in database schema
    },
    mode: "onChange",
  });

  const onSignupSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Create user account with Supabase Auth
      console.log('Signing up user with hospital:', data.hospital);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
            hospital: data.hospital,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user) {
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Manually ensure hospital assignment if the trigger didn't work
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profile && !profile.hospital_id) {
            console.log('Profile found but no hospital_id, attempting to assign hospital:', data.hospital);
            // Get hospital ID by name
            const { data: hospital, error: hospitalError } = await supabase
              .from('hospitals')
              .select('id')
              .eq('name', data.hospital)
              .single();

            if (hospital && !hospitalError) {
              console.log('Hospital found, updating profile with hospital_id:', hospital.id);
              // Update profile with hospital_id
              await supabase
                .from('profiles')
                .update({ hospital_id: hospital.id })
                .eq('id', authData.user.id);
            } else {
              console.error('Hospital not found or error:', hospitalError);
            }
          } else if (profile && profile.hospital_id) {
            console.log('Profile already has hospital_id:', profile.hospital_id);
          }
        } catch (profileErr) {
          console.warn('Profile assignment warning:', profileErr);
          // Continue anyway - the user can still sign in
        }

        setSuccess(
          "Account created successfully! Please check your email to verify your account."
        );

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during signup"
      );
    } finally {
      setIsLoading(false);
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
            Join our platform to manage and monitor sustainability metrics
            across all hospital departments
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-[#225384] hover:text-[#1a4a6b] mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Sign In
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Sign up to access the hospital sustainability dashboard
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Form {...signupForm} key="signup-form">
              <form
                onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={signupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          className="h-12 border-2 border-gray-200 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          className="h-12 border-2 border-gray-200 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 border-2 border-gray-200 rounded-lg">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="department_head">
                            Department Head
                          </SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="hospital"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hospital</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 border-2 border-gray-200 rounded-lg">
                            <SelectValue placeholder="Select a hospital" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="General Hospital North">
                            General Hospital North
                          </SelectItem>
                          <SelectItem value="General Hospital South">
                            General Hospital South
                          </SelectItem>
                          <SelectItem value="General Hospital East">
                            General Hospital East
                          </SelectItem>
                          <SelectItem value="General Hospital West">
                            General Hospital West
                          </SelectItem>
                          <SelectItem value="Central Medical Center">
                            Central Medical Center
                          </SelectItem>
                          <SelectItem value="Regional Hospital A">
                            Regional Hospital A
                          </SelectItem>
                          <SelectItem value="Regional Hospital B">
                            Regional Hospital B
                          </SelectItem>
                          <SelectItem value="Metropolitan Hospital">
                            Metropolitan Hospital
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Department field removed - not in database schema */}

                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            {...field}
                            className="h-12 pl-4 pr-12 border-2 border-gray-200 rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400"
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

                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            {...field}
                            className="h-12 pl-4 pr-12 border-2 border-gray-200 rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
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
                      Creating account...
                    </div>
                  ) : (
                    <span>Create Account</span>
                  )}
                </Button>

                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-[#225384] font-medium hover:text-[#1a4a6b] transition-colors"
                    >
                      Sign in here
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
