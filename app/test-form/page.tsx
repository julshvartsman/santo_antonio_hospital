"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Logo from "@/components/ui/Logo";

const testSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type TestFormData = z.infer<typeof testSchema>;

export default function TestFormPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // React Hook Form test
  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: TestFormData) => {
    console.log("Form Submitted:", data);
    alert(
      `Form Submitted!\nName: ${data.name}\nEmail: ${data.email}\nPassword: ${data.password}`
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <Logo size="md" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Input Test Form</h1>
        </div>

        <div className="space-y-6">
          {/* Basic HTML Input Test */}
          <div>
            <Label htmlFor="html-name">HTML Name (Direct Input)</Label>
            <input
              id="html-name"
              type="text"
              placeholder="Type here..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <p className="text-sm text-gray-600 mt-1">Value: {name}</p>
          </div>

          {/* UI Component Test */}
          <div>
            <Label htmlFor="ui-email">UI Email (Component)</Label>
            <Input
              id="ui-email"
              type="email"
              placeholder="Type your email here..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
            />
            <p className="text-sm text-gray-600 mt-1">Value: {email}</p>
          </div>

          <div>
            <Label htmlFor="ui-password">UI Password (Component)</Label>
            <Input
              id="ui-password"
              type="password"
              placeholder="Type your password here..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
            />
            <p className="text-sm text-gray-600 mt-1">
              Value: {password ? "*".repeat(password.length) : ""}
            </p>
          </div>

          {/* React Hook Form Test */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">React Hook Form Test</h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Form Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Type your name..."
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Form Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Form Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Submit Form Test
                </Button>
              </form>
            </Form>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => {
                alert(`Name: ${name}, Email: ${email}, Password: ${password}`);
              }}
              className="w-full"
            >
              Test State Values
            </Button>

            <Button
              onClick={() => {
                setName("");
                setEmail("");
                setPassword("");
                form.reset();
              }}
              variant="outline"
              className="w-full"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
