"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  MessageCircle,
  BookOpen,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DepartmentHelp() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        setSubmitMessage(
          "Your message has been sent successfully! We will get back to you soon."
        );
        // Reset form
        setFormData({
          firstName: user?.name?.split(" ")[0] || "",
          lastName: user?.name?.split(" ").slice(1).join(" ") || "",
          email: user?.email || "",
          phone: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
        setSubmitMessage(
          result.error || "Failed to send message. Please try again."
        );
      }
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-2">
          Get help with using the sustainability dashboard
        </p>
      </div>

      {/* Contact Information */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Send Message</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Submit Status Alert */}
            {submitStatus !== "idle" && (
              <Alert
                className={`mb-4 ${
                  submitStatus === "success"
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                {submitStatus === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription
                  className={
                    submitStatus === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }
                >
                  {submitMessage}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#225384] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#225384] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john.doe@hospital.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#225384] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+351 960 960 960"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#225384] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write your message.."
                  rows={5}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#225384] focus:border-transparent"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#225384] hover:bg-[#1a4a6b] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-[#225384] mt-1" />
                <div>
                  <h4 className="font-medium">Phone</h4>
                  <p className="text-sm text-gray-600">+351 912 135 981</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-[#225384] mt-1" />
                <div>
                  <h4 className="font-medium">Email</h4>
                  <p className="text-sm text-gray-600">
                    goncalo.silva@chporto.min-saude.pt
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-5 w-5 text-[#225384] mt-1 flex items-center justify-center">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Address</h4>
                  <p className="text-sm text-gray-600">
                    Largo Professor Abel Salazar
                    <br />
                    4099-001 Porto
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Direct Support Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[#225384]">
              Contact for direct support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                Chat on WhatsApp
              </Button>
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white border-2 border-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">QR Code</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">WhatsApp</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section - Now below the send message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>Frequently Asked Questions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                How do I submit my monthly sustainability data?
              </AccordionTrigger>
              <AccordionContent>
                Navigate to the Data Entry page from the sidebar menu. Fill in
                your department's sustainability metrics including energy usage,
                water consumption, and waste data. Click "Submit Data" when
                complete.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>
                What if I need to edit data I've already submitted?
              </AccordionTrigger>
              <AccordionContent>
                Once data is submitted, you cannot edit it directly. Please
                contact your administrator if you need to make corrections to
                submitted data.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>
                How do I export my department's data?
              </AccordionTrigger>
              <AccordionContent>
                Go to the Data Entry page and switch to the "Reports &
                Analytics" tab. You can export your data in CSV format by
                clicking the "Export CSV" button.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>When are monthly reports due?</AccordionTrigger>
              <AccordionContent>
                Monthly sustainability reports are typically due by the 15th of
                each month for the previous month's data. You'll receive email
                reminders as the deadline approaches.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>How do I change my password?</AccordionTrigger>
              <AccordionContent>
                Go to Settings from the sidebar menu. In the Security Settings
                section, enter your current password and then your new password.
                Click "Change Password" to save the changes.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>
                What sustainability metrics should I track?
              </AccordionTrigger>
              <AccordionContent>
                You should track energy usage (kWh), water consumption (m³),
                waste generation (kg), and recycling rates (%). Additional
                metrics may be required based on your hospital's specific
                sustainability goals.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger>
                How do I view my department's reports and analytics?
              </AccordionTrigger>
              <AccordionContent>
                Go to the Data Entry page and click on the "Reports & Analytics"
                tab. Here you can view energy trends, monthly reports, and
                export your data.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger>
                What if I can't access my account?
              </AccordionTrigger>
              <AccordionContent>
                If you're having trouble accessing your account, try resetting
                your password on the login page. If the issue persists, contact
                support using the form above or call the support number
                provided.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
