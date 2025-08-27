"use client";

import React from "react";
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
  BookOpen,
  Phone,
  Mail,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/components/providers/AppProvider";

export default function DepartmentHelp() {
  const { user } = useAuth();
  const { language } = useApp();

  const openWhatsAppToAdmin = () => {
    // Prefer env var, fallback to contact info number
    const adminPhone = (
      process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "+351 912 135 981"
    ).trim();
    const digits = adminPhone.replace(/\D/g, "");
    if (!digits) return;
    const text = `Hello, I need assistance with the Hospital Sustainability Dashboard.`;
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {language.t("dept.help.title")}
        </h1>
        <p className="text-gray-600 mt-2">
          {language.t("dept.help.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>{language.t("dept.help.contactInfo")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-[#225384] mt-1" />
                <div>
                  <h4 className="font-medium">
                    {language.t("dept.help.phone")}
                  </h4>
                  <p className="text-sm text-gray-600">+351 912 135 981</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-[#225384] mt-1" />
                <div>
                  <h4 className="font-medium">
                    {language.t("dept.help.email")}
                  </h4>
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
                  <h4 className="font-medium">
                    {language.t("dept.help.address")}
                  </h4>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-[#225384]">
              {language.t("dept.help.directSupport")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={openWhatsAppToAdmin}
              >
                {language.t("dept.help.chatWhatsApp")}
              </Button>
              <span className="text-sm text-gray-600">
                {language.t("dept.help.chatWhatsAppDesc")}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
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
                Monthly reports are typically due by the 15th of the following
                month. You'll receive notifications when your report is due or
                overdue.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>
                What metrics should I include in my report?
              </AccordionTrigger>
              <AccordionContent>
                Include energy consumption (kWh), water usage (m³), waste
                generation (kg), recycling rates (%), CO₂ emissions (kg), and
                any renewable energy usage. Additional metrics like paper usage
                and chemical usage are optional.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>
                How do I get help if I'm having technical issues?
              </AccordionTrigger>
              <AccordionContent>
                For technical support, you can contact us via WhatsApp using the
                button above, or reach out via phone or email using the contact
                information provided.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Documentation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Documentation & Resources</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Sustainability Metrics Guide
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Learn about the different sustainability metrics and how to
                measure them accurately.
              </p>
              <Button variant="outline" size="sm">
                Download Guide
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Best Practices
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Discover best practices for reducing energy consumption and
                improving sustainability in healthcare settings.
              </p>
              <Button variant="outline" size="sm">
                View Best Practices
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
