import { useState, useEffect } from "react";

type Language = "en" | "pt";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Simple translations
const translations = {
  en: {
    "login.title": "Sign In",
    "login.email": "Email",
    "login.password": "Password",
    "login.remember": "Remember me",
    "login.forgot": "Forgot password?",
    "login.signin": "Sign In",
    "login.signup": "Don't have an account?",
    "signup.title": "Create Account",
    "signup.name": "Full Name",
    "signup.confirmPassword": "Confirm Password",
    "signup.create": "Create Account",
    "signup.login": "Already have an account?",
    "dashboard.admin": "Admin Dashboard",
    "dashboard.department": "Department Dashboard",
    "dashboard.manage": "Manage hospital sustainability metrics and reports",
    "dashboard.metrics":
      "Manage your hospital's monthly sustainability metrics",
    "menu.dashboard": "Dashboard",
    "menu.dataAnalysis": "Data Analysis",
    "menu.fileUpload": "File Upload",
    "menu.notifications": "Notifications",
    "menu.dataEntry": "Data Entry",
    "menu.reports": "Reports",
    "menu.export": "Export Data",
    "menu.settings": "Settings",
    "menu.contact": "Contact",
    "menu.help": "Help",
    "others.menu": "Others",
    "back.to.main": "Back to Main Site",
    "user.menu": "User Menu",
    logout: "Logout",
    menu: "Menu",
    others: "Others",
  },
  pt: {
    "login.title": "Entrar",
    "login.email": "Email",
    "login.password": "Senha",
    "login.remember": "Lembrar de mim",
    "login.forgot": "Esqueceu a senha?",
    "login.signin": "Entrar",
    "login.signup": "Não tem conta?",
    "signup.title": "Criar Conta",
    "signup.name": "Nome Completo",
    "signup.confirmPassword": "Confirmar Senha",
    "signup.create": "Criar Conta",
    "signup.login": "Já tem conta?",
    "dashboard.admin": "Painel Administrativo",
    "dashboard.department": "Painel do Departamento",
    "dashboard.manage":
      "Gerencie métricas de sustentabilidade hospitalar e relatórios",
    "dashboard.metrics":
      "Gerencie as métricas mensais de sustentabilidade do seu hospital",
    "menu.dashboard": "Painel",
    "menu.dataAnalysis": "Análise de Dados",
    "menu.fileUpload": "Upload de Arquivos",
    "menu.notifications": "Notificações",
    "menu.dataEntry": "Entrada de Dados",
    "menu.reports": "Relatórios",
    "menu.export": "Exportar Dados",
    "menu.settings": "Configurações",
    "menu.contact": "Contato",
    "menu.help": "Ajuda",
    "others.menu": "Outros",
    "back.to.main": "Voltar ao Site Principal",
    "user.menu": "Menu do Usuário",
    logout: "Sair",
    menu: "Menu",
    others: "Outros",
  },
};

export function useLanguage(): LanguageContextType {
  const [language, setLanguage] = useState<Language>("en");

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "pt")) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when changed
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: string): string => {
    return (
      translations[language][key as keyof (typeof translations)["en"]] || key
    );
  };

  return {
    language,
    setLanguage,
    t,
  };
}
