"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { ArrowLeft, Building2, Languages, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/hooks/useLanguage";
import { sleep } from "@/lib/utils";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { language, setLanguage, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await sleep(2000);
      setSuccess(true);
    } catch (error) {
      console.error("Password reset failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "pt" : "en");
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="bg-green-500/10 p-3 rounded-full">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {language === "en"
                    ? "Check Your Email"
                    : "Verifique Seu Email"}
                </CardTitle>
                <CardDescription className="text-base">
                  {language === "en"
                    ? "We've sent password reset instructions to your email address."
                    : "Enviamos instruções para redefinir sua senha para seu email."}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert variant="success">
                <AlertDescription>
                  {language === "en"
                    ? "If an account with that email exists, you will receive reset instructions shortly."
                    : "Se existir uma conta com esse email, você receberá instruções de redefinição em breve."}
                </AlertDescription>
              </Alert>

              <Link href="/login">
                <Button className="w-full" variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {language === "en" ? "Back to Login" : "Voltar ao Login"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Language Toggle */}
        <div className="flex items-center justify-end space-x-2">
          <Languages className="h-4 w-4" />
          <span className="text-sm">EN</span>
          <Switch
            checked={language === "pt"}
            onCheckedChange={toggleLanguage}
            className="data-[state=checked]:bg-green-600"
          />
          <span className="text-sm">PT</span>
        </div>

        {/* Forgot Password Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {language === "en" ? "Reset Password" : "Redefinir Senha"}
              </CardTitle>
              <CardDescription className="text-base">
                {language === "en"
                  ? "Enter your email address and we'll send you reset instructions."
                  : "Digite seu email e enviaremos instruções para redefinir sua senha."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@cityx-hospital.com"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading
                    ? t("general.loading")
                    : language === "en"
                    ? "Send Reset Instructions"
                    : "Enviar Instruções"}
                </Button>
              </form>
            </Form>

            <Link href="/login">
              <Button className="w-full" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === "en" ? "Back to Login" : "Voltar ao Login"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
