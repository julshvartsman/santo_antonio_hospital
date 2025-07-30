"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { UseAuthReturn, UseLanguageReturn } from "@/types";

interface AppContextType {
  auth: UseAuthReturn;
  language: UseLanguageReturn;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const auth = useAuth();
  const language = useLanguage();

  return (
    <AppContext.Provider value={{ auth, language }}>
      {children}
    </AppContext.Provider>
  );
}
