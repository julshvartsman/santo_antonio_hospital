"use client";

import React from "react";
import { useApp } from "@/components/providers/AppProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DepartmentHeader() {
  const { language } = useApp();

  const handleLanguageChange = (value: string) => {
    language.setLanguage(value as "en" | "pt");
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Santo António Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/images/santo-antonio logo.png" 
              alt="Santo António Logo" 
              className="h-12 w-auto"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="w-32">
            <Select
              value={language.language}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">Eng (US)</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language Indicator */}
          <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
            {language.language === "en" ? "English" : "Português"}
          </div>
        </div>
      </div>
    </div>
  );
}
