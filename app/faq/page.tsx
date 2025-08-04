"use client";

import React, { useState } from "react";
import {
  Search,
  HelpCircle,
  Book,
  Settings,
  Database,
  Calendar,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useApp } from "@/components/providers/AppProvider";
import { mockFAQs } from "@/utils/mockData";
import Logo from "@/components/ui/Logo";

const categoryIcons = {
  "Data Entry": Database,
  Deadlines: Calendar,
  Language: Settings,
  Support: Users,
  Analytics: Book,
};

// Disable static generation for this page
export const dynamic = "force-dynamic";

export default function FAQPage() {
  const { language } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter FAQs based on search term
  const filteredFAQs = mockFAQs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group FAQs by category
  const faqsByCategory = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, typeof mockFAQs>);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Logo size="sm" />
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <HelpCircle className="h-8 w-8 mr-3 text-primary" />
            FAQ
          </h1>
        </div>
        <p className="text-gray-600 mt-2">
          {language.language === "en"
            ? "Find answers to common questions about the sustainability data system."
            : "Encontre respostas para perguntas comuns sobre o sistema de dados de sustentabilidade."}
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={
                language.language === "en" ? "Search FAQ..." : "Buscar FAQ..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQ Categories */}
      <div className="space-y-6">
        {Object.entries(faqsByCategory).map(([category, faqs]) => {
          const IconComponent =
            categoryIcons[category as keyof typeof categoryIcons] || HelpCircle;

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IconComponent className="h-5 w-5 mr-2 text-primary" />
                  {category}
                </CardTitle>
                <CardDescription>
                  {faqs.length}{" "}
                  {language.language === "en" ? "questions" : "perguntas"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredFAQs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language.language === "en"
                ? "No results found"
                : "Nenhum resultado encontrado"}
            </h3>
            <p className="text-gray-600">
              {language.language === "en"
                ? "Try adjusting your search terms or browse all categories above."
                : "Tente ajustar seus termos de busca ou navegue por todas as categorias acima."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contact Support */}
      <Card className="border-dashed border-2 border-primary/20">
        <CardContent className="p-6 text-center">
          <Users className="h-8 w-8 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {language.language === "en"
              ? "Still need help?"
              : "Ainda precisa de ajuda?"}
          </h3>
          <p className="text-gray-600 mb-4">
            {language.language === "en"
              ? "Contact our support team or use the floating help button for immediate assistance."
              : "Entre em contato com nossa equipe de suporte ou use o botão de ajuda flutuante para assistência imediata."}
          </p>
          <p className="text-sm text-gray-500">
            {language.language === "en"
              ? 'You can also use the "Notify Team" button to contact Mr. Silva directly via WhatsApp.'
              : 'Você também pode usar o botão "Notificar Equipe" para contatar o Sr. Silva diretamente via WhatsApp.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
