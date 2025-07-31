import { useState, useEffect } from "react";
import { Language, UseLanguageReturn } from "@/types";
import { getFromStorage, setToStorage } from "@/lib/utils";

// Translation dictionary
const translations = {
  en: {
    // Authentication
    "auth.login": "Login",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot password?",
    "auth.signIn": "Sign In",
    "auth.logout": "Logout",
    "auth.rememberMe": "Remember me",

    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.dataEntry": "Data Entry",
    "nav.analytics": "Analytics",
    "nav.settings": "Settings",
    "nav.help": "Help",

    // Data Entry
    "data.sustainability": "Sustainability Data",
    "data.category": "Category",
    "data.metric": "Metric",
    "data.value": "Value",
    "data.unit": "Unit",
    "data.target": "Target",
    "data.status": "Status",
    "data.lastUpdated": "Last Updated",
    "data.locked": "Locked",
    "data.unlock": "Unlock",
    "data.save": "Save",
    "data.edit": "Edit",

    // Notifications
    "notifications.daysUntilDue": "days until due",
    "notifications.overdue": "Overdue",
    "notifications.notifyTeam": "Notify Team",
    "notifications.contactMrSilva": "Contact Mr. Silva",

    // Support
    "support.help": "Help",
    "support.faq": "FAQ",
    "support.askQuestion": "Ask a question...",
    "support.send": "Send",

    // General
    "general.loading": "Loading...",
    "general.error": "Error",
    "general.success": "Success",
    "general.warning": "Warning",
    "general.info": "Information",
    "general.close": "Close",
    "general.cancel": "Cancel",
    "general.confirm": "Confirm",
    "general.language": "Language",
  },
  pt: {
    // Authentication
    "auth.login": "Entrar",
    "auth.email": "Email",
    "auth.password": "Senha",
    "auth.forgotPassword": "Esqueceu a senha?",
    "auth.signIn": "Entrar",
    "auth.logout": "Sair",
    "auth.rememberMe": "Lembrar de mim",

    // Navigation
    "nav.dashboard": "Painel",
    "nav.dataEntry": "Entrada de Dados",
    "nav.analytics": "Analíticas",
    "nav.settings": "Configurações",
    "nav.help": "Ajuda",

    // Data Entry
    "data.sustainability": "Dados de Sustentabilidade",
    "data.category": "Categoria",
    "data.metric": "Métrica",
    "data.value": "Valor",
    "data.unit": "Unidade",
    "data.target": "Meta",
    "data.status": "Status",
    "data.lastUpdated": "Última Atualização",
    "data.locked": "Bloqueado",
    "data.unlock": "Desbloquear",
    "data.save": "Salvar",
    "data.edit": "Editar",

    // Notifications
    "notifications.daysUntilDue": "dias até o vencimento",
    "notifications.overdue": "Atrasado",
    "notifications.notifyTeam": "Notificar Equipe",
    "notifications.contactMrSilva": "Contatar Sr. Silva",

    // Support
    "support.help": "Ajuda",
    "support.faq": "Perguntas Frequentes",
    "support.askQuestion": "Faça uma pergunta...",
    "support.send": "Enviar",

    // General
    "general.loading": "Carregando...",
    "general.error": "Erro",
    "general.success": "Sucesso",
    "general.warning": "Aviso",
    "general.info": "Informação",
    "general.close": "Fechar",
    "general.cancel": "Cancelar",
    "general.confirm": "Confirmar",
    "general.language": "Idioma",
  },
};

export function useLanguage(): UseLanguageReturn {
  const [language, setLanguageState] = useState<Language>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language from localStorage after component mounts
  useEffect(() => {
    const savedLanguage = getFromStorage<Language>("language", "en");
    setLanguageState(savedLanguage);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      setToStorage("language", language);
    }
  }, [language, isInitialized]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value = translations[language] as any;

    for (const k of keys) {
      value = value?.[k];
    }

    // Return the translated value or fallback to English if current language fails
    if (value) {
      return value;
    }

    // Fallback to English translation
    if (language !== "en") {
      let englishValue = translations["en"] as any;
      for (const k of keys) {
        englishValue = englishValue?.[k];
      }
      if (englishValue) {
        return englishValue;
      }
    }

    // Final fallback to the key itself
    return key;
  };

  return {
    language,
    setLanguage,
    t,
  };
}
