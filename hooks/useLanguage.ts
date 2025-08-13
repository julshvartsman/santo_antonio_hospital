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
    "menu.supportMessages": "Support Messages",
    "menu.contact": "Contact",
    "menu.help": "Help",
    "others.menu": "Others",
    "back.to.main": "Back to Main Site",
    "user.menu": "User Menu",
    logout: "Logout",
    menu: "Menu",
    others: "Others",
    // Common
    "common.loading": "Loading...",
    "common.loadingData": "Loading data...",
    "common.loadingForm": "Loading form...",
    "common.loadingDashboard": "Loading dashboard...",
    "common.tryAgain": "Try Again",
    "common.current": "Current",
    "common.average": "Average",
    "common.peak": "Peak",
    "common.never": "Never",
    "common.notSubmitted": "Not submitted",
    "buttons.view": "View",
    "buttons.edit": "Edit",
    "buttons.saveChanges": "Save Changes",
    "buttons.changePassword": "Change Password",
    "buttons.configure": "Configure",
    "buttons.markAllRead": "Mark all as read",
    "buttons.markAsRead": "Mark as read",
    "buttons.goToDataEntry": "Go to Data Entry",
    // Department - Dashboard
    "dept.dashboard.dataEntryReports": "Data Entry & Reports",
    "dept.dashboard.enterMonthly": "Enter monthly metrics and view reports",
    "dept.dashboard.metricsSubmitted": "Metrics Submitted",
    "dept.dashboard.submissionPending": "Submission Pending",
    "dept.dashboard.submitNow": "Click here to submit now",
    "dept.dashboard.energyTrendTitle": "12-Month Energy Trend",
    "dept.dashboard.energyTrendDesc":
      "Your hospital's energy usage over the past year",
    "dept.dashboard.totalEntries": "Total Entries",
    "dept.dashboard.entriesSubtitle": "Monthly reports submitted",
    "dept.dashboard.avgEnergy": "Average Energy Usage",
    "dept.dashboard.monthlyAverage": "Monthly average",
    "dept.dashboard.lastUpdated": "Last Updated",
    "dept.dashboard.lastDataEntry": "Last data entry",
    // Department - Data Entry
    "dept.dataEntry.title": "Data Entry & Reports",
    "dept.dataEntry.subtitle":
      "Manage your monthly sustainability data and view reports",
    "dept.dataEntry.tab.entry": "Data Entry",
    "dept.dataEntry.tab.reports": "Reports & Analytics",
    "dept.dataEntry.table.formName": "Form Name",
    "dept.dataEntry.table.status": "Status",
    "dept.dataEntry.table.submittedDate": "Submitted Date",
    "dept.dataEntry.table.actions": "Actions",
    "dept.dataEntry.status.submitted": "Submitted",
    "dept.dataEntry.status.draft": "Draft",
    "dept.dataEntry.button.view": "View",
    "dept.dataEntry.button.edit": "Edit",
    "dept.reports.energyTrendTitle": "12-Month Energy Trend",
    "dept.reports.energyTrendDesc":
      "Your hospital's energy usage over the past year",
    "dept.reports.monthlyReport": "Monthly Report",
    "dept.reports.status": "Status",
    "dept.reports.period": "Period",
    "dept.reports.submitted": "Submitted",
    // Department - Notifications
    "dept.notifications.title": "Notifications",
    "dept.notifications.subtitle":
      "Stay updated with important messages and alerts",
    "dept.notifications.unread": "unread",
    "dept.notifications.loading": "Loading notifications…",
    "dept.notifications.failed": "Failed to load notifications",
    "dept.notifications.none": "No notifications",
    "dept.notifications.caughtUp":
      "You're all caught up! Check back later for new updates.",
    "dept.notifications.new": "New",
    "dept.notifications.settings": "Notification Settings",
    "dept.notifications.managePrefs": "Manage your notification preferences",
    "dept.notifications.email": "Email Notifications",
    "dept.notifications.emailDesc": "Receive notifications via email",
    "dept.notifications.reminders": "Report Reminders",
    "dept.notifications.remindersDesc":
      "Get reminded about upcoming report deadlines",
    "dept.notifications.system": "System Updates",
    "dept.notifications.systemDesc":
      "Receive notifications about system maintenance and updates",
    // Department - Settings
    "dept.settings.title": "Settings",
    "dept.settings.subtitle": "Manage your account settings and preferences",
    "dept.settings.profile": "Profile Settings",
    "dept.settings.fullName": "Full Name",
    "dept.settings.hospital": "Hospital",
    "dept.settings.department": "Department",
    "dept.settings.notifications": "Notification Settings",
    "dept.settings.emailNotifications": "Email Notifications",
    "dept.settings.reportReminders": "Report Reminders",
    "dept.settings.dataUpdates": "Data Updates",
    "dept.settings.dataUpdatesDesc": "Notifications when data is updated",
    "dept.settings.security": "Security Settings",
    "dept.settings.currentPassword": "Current Password",
    "dept.settings.newPassword": "New Password",
    "dept.settings.confirmPassword": "Confirm New Password",
    "dept.settings.system": "System Settings",
    "dept.settings.autoSaveDrafts": "Auto-save Drafts",
    "dept.settings.autoSaveDraftsDesc":
      "Automatically save form data as drafts",
    "dept.settings.dataExport": "Data Export",
    "dept.settings.dataExportDesc": "Allow data export functionality",
    "dept.settings.analytics": "Analytics",
    "dept.settings.analyticsDesc": "Enable analytics and reporting features",
    // Department - Help
    "dept.help.title": "Help & Support",
    "dept.help.subtitle": "Get help with using the sustainability dashboard",
    "dept.help.sendMessage": "Send Message",
    "dept.help.firstName": "First Name",
    "dept.help.lastName": "Last Name",
    "dept.help.phoneNumber": "Phone Number",
    "dept.help.message": "Message",
    "dept.help.sending": "Sending...",
    "dept.help.send": "Send Message",
    "dept.help.contactInfo": "Contact Information",
    "dept.help.phone": "Phone",
    "dept.help.email": "Email",
    "dept.help.address": "Address",
    "dept.help.directSupport": "Direct Support",
    "dept.help.chatWhatsApp": "Chat on WhatsApp",
    "dept.help.chatWhatsAppDesc": "Message our team on WhatsApp",
    // Admin - Common/Sections
    "admin.common.loading": "Loading...",
    "admin.common.loadingUsers": "Loading users...",
    "admin.common.loadingDepartments": "Loading department heads...",
    "admin.common.noDepartments": "No department heads found",
    "admin.common.noForms": "No forms data found",
    "admin.common.notAssigned": "Not assigned",
    "admin.common.na": "N/A",
    "admin.common.never": "Never",
    "admin.common.submitted": "Submitted",
    "admin.common.pending": "Pending",
    "admin.dashboard.deptSectionTitle":
      "Department Heads - Submission Status & Reminders",
    "admin.dashboard.deptSectionHelp":
      "Assign department heads to hospitals in the User Management section below to enable reminder functionality.",
    "admin.dashboard.sendReminder": "Send Reminder",
    "admin.dashboard.sending": "Sending...",
    "admin.dashboard.submitted": "Submitted",
    "admin.users.sectionTitle": "User Management - Hospital Assignment",
    "admin.users.loading": "Loading users...",
    "admin.users.allAssigned": "All users have been assigned to hospitals!",
    "admin.users.table.name": "Name",
    "admin.users.table.email": "Email",
    "admin.users.table.role": "Role",
    "admin.users.table.created": "Created",
    "admin.users.table.assignHospital": "Assign Hospital",
    "admin.forms.sectionTitle": "All Hospital Submissions - Forms Data",
    "admin.forms.sectionDesc":
      'View all form submissions from every hospital. Click "View Report" to see detailed metrics.',
    "admin.forms.loading": "Loading forms data...",
    "admin.forms.error": "Error loading forms data",
    "admin.forms.totals": "Total Forms",
    "admin.forms.submitted": "Submitted",
    "admin.forms.pending": "Pending",
    "admin.forms.refresh": "Refresh",
    "admin.forms.table.hospital": "Hospital",
    "admin.forms.table.deptHead": "Department Head",
    "admin.forms.table.monthYear": "Month/Year",
    "admin.forms.table.status": "Status",
    "admin.forms.table.submittedAt": "Submitted At",
    "admin.forms.table.created": "Created",
    "admin.forms.table.actions": "Actions",
    "admin.forms.viewReport": "View Report",
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
    "menu.supportMessages": "Mensagens de Suporte",
    "menu.contact": "Contato",
    "menu.help": "Ajuda",
    "others.menu": "Outros",
    "back.to.main": "Voltar ao Site Principal",
    "user.menu": "Menu do Usuário",
    logout: "Sair",
    menu: "Menu",
    others: "Outros",
    // Common
    "common.loading": "A carregar...",
    "common.loadingData": "A carregar dados...",
    "common.loadingForm": "A carregar formulário...",
    "common.loadingDashboard": "A carregar painel...",
    "common.tryAgain": "Tentar novamente",
    "common.current": "Atual",
    "common.average": "Média",
    "common.peak": "Pico",
    "common.never": "Nunca",
    "common.notSubmitted": "Não submetido",
    "buttons.view": "Ver",
    "buttons.edit": "Editar",
    "buttons.saveChanges": "Guardar Alterações",
    "buttons.changePassword": "Alterar Palavra-passe",
    "buttons.configure": "Configurar",
    "buttons.markAllRead": "Marcar tudo como lido",
    "buttons.markAsRead": "Marcar como lido",
    "buttons.goToDataEntry": "Ir para Entrada de Dados",
    // Department - Dashboard
    "dept.dashboard.dataEntryReports": "Entrada de Dados e Relatórios",
    "dept.dashboard.enterMonthly":
      "Introduza métricas mensais e veja relatórios",
    "dept.dashboard.metricsSubmitted": "Métricas Submetidas",
    "dept.dashboard.submissionPending": "Submissão Pendente",
    "dept.dashboard.submitNow": "Clique aqui para submeter agora",
    "dept.dashboard.energyTrendTitle": "Tendência de Energia (12 meses)",
    "dept.dashboard.energyTrendDesc":
      "Consumo de energia do seu hospital no último ano",
    "dept.dashboard.totalEntries": "Entradas Totais",
    "dept.dashboard.entriesSubtitle": "Relatórios mensais submetidos",
    "dept.dashboard.avgEnergy": "Consumo Médio de Energia",
    "dept.dashboard.monthlyAverage": "Média mensal",
    "dept.dashboard.lastUpdated": "Última Atualização",
    "dept.dashboard.lastDataEntry": "Última entrada de dados",
    // Department - Data Entry
    "dept.dataEntry.title": "Entrada de Dados e Relatórios",
    "dept.dataEntry.subtitle":
      "Gira os seus dados mensais de sustentabilidade e veja relatórios",
    "dept.dataEntry.tab.entry": "Entrada de Dados",
    "dept.dataEntry.tab.reports": "Relatórios e Análises",
    "dept.dataEntry.table.formName": "Nome do Formulário",
    "dept.dataEntry.table.status": "Estado",
    "dept.dataEntry.table.submittedDate": "Data de Submissão",
    "dept.dataEntry.table.actions": "Ações",
    "dept.dataEntry.status.submitted": "Submetido",
    "dept.dataEntry.status.draft": "Rascunho",
    "dept.dataEntry.button.view": "Ver",
    "dept.dataEntry.button.edit": "Editar",
    "dept.reports.energyTrendTitle": "Tendência de Energia (12 meses)",
    "dept.reports.energyTrendDesc":
      "Consumo de energia do seu hospital no último ano",
    "dept.reports.monthlyReport": "Relatório Mensal",
    "dept.reports.status": "Estado",
    "dept.reports.period": "Período",
    "dept.reports.submitted": "Submetido",
    // Department - Notifications
    "dept.notifications.title": "Notificações",
    "dept.notifications.subtitle":
      "Mantenha-se atualizado com mensagens e alertas importantes",
    "dept.notifications.unread": "por ler",
    "dept.notifications.loading": "A carregar notificações…",
    "dept.notifications.failed": "Falha ao carregar as notificações",
    "dept.notifications.none": "Sem notificações",
    "dept.notifications.caughtUp":
      "Está a par de tudo! Volte mais tarde para novas atualizações.",
    "dept.notifications.new": "Novo",
    "dept.notifications.settings": "Definições de Notificações",
    "dept.notifications.managePrefs":
      "Gira as suas preferências de notificações",
    "dept.notifications.email": "Notificações por Email",
    "dept.notifications.emailDesc": "Receba notificações por email",
    "dept.notifications.reminders": "Lembretes de Relatório",
    "dept.notifications.remindersDesc":
      "Receba lembretes sobre prazos de relatórios",
    "dept.notifications.system": "Atualizações do Sistema",
    "dept.notifications.systemDesc":
      "Receba notificações sobre manutenção e atualizações do sistema",
    // Department - Settings
    "dept.settings.title": "Definições",
    "dept.settings.subtitle": "Gira as definições e preferências da sua conta",
    "dept.settings.profile": "Definições de Perfil",
    "dept.settings.fullName": "Nome Completo",
    "dept.settings.hospital": "Hospital",
    "dept.settings.department": "Departamento",
    "dept.settings.notifications": "Definições de Notificações",
    "dept.settings.emailNotifications": "Notificações por Email",
    "dept.settings.reportReminders": "Lembretes de Relatório",
    "dept.settings.dataUpdates": "Atualizações de Dados",
    "dept.settings.dataUpdatesDesc":
      "Notificações quando os dados forem atualizados",
    "dept.settings.security": "Definições de Segurança",
    "dept.settings.currentPassword": "Palavra-passe Atual",
    "dept.settings.newPassword": "Nova Palavra-passe",
    "dept.settings.confirmPassword": "Confirmar Nova Palavra-passe",
    "dept.settings.system": "Definições do Sistema",
    "dept.settings.autoSaveDrafts": "Guardar Rascunhos Automaticamente",
    "dept.settings.autoSaveDraftsDesc":
      "Guardar automaticamente os dados do formulário como rascunhos",
    "dept.settings.dataExport": "Exportação de Dados",
    "dept.settings.dataExportDesc":
      "Permitir funcionalidade de exportação de dados",
    "dept.settings.analytics": "Analítica",
    "dept.settings.analyticsDesc":
      "Ativar funcionalidades de análise e relatórios",
    // Department - Help
    "dept.help.title": "Ajuda e Suporte",
    "dept.help.subtitle":
      "Obtenha ajuda para usar o dashboard de sustentabilidade",
    "dept.help.sendMessage": "Enviar Mensagem",
    "dept.help.firstName": "Primeiro Nome",
    "dept.help.lastName": "Apelido",
    "dept.help.phoneNumber": "Número de Telefone",
    "dept.help.message": "Mensagem",
    "dept.help.sending": "A enviar...",
    "dept.help.send": "Enviar Mensagem",
    "dept.help.contactInfo": "Informações de Contacto",
    "dept.help.phone": "Telefone",
    "dept.help.email": "Email",
    "dept.help.address": "Morada",
    "dept.help.directSupport": "Suporte Direto",
    "dept.help.chatWhatsApp": "Conversar no WhatsApp",
    "dept.help.chatWhatsAppDesc": "Envie mensagem à nossa equipa no WhatsApp",
    // Admin - Common/Sections
    "admin.common.loading": "A carregar...",
    "admin.common.loadingUsers": "A carregar utilizadores...",
    "admin.common.loadingDepartments":
      "A carregar responsáveis de departamento...",
    "admin.common.noDepartments": "Sem responsáveis de departamento",
    "admin.common.noForms": "Sem dados de formulários",
    "admin.common.notAssigned": "Não atribuído",
    "admin.common.na": "N/D",
    "admin.common.never": "Nunca",
    "admin.common.submitted": "Submetido",
    "admin.common.pending": "Pendente",
    "admin.dashboard.deptSectionTitle":
      "Responsáveis de Departamento - Estado de Submissão e Lembretes",
    "admin.dashboard.deptSectionHelp":
      "Atribua responsáveis aos hospitais na secção de Gestão de Utilizadores abaixo para ativar a funcionalidade de lembretes.",
    "admin.dashboard.sendReminder": "Enviar Lembrete",
    "admin.dashboard.sending": "A enviar...",
    "admin.dashboard.submitted": "Submetido",
    "admin.users.sectionTitle":
      "Gestão de Utilizadores - Atribuição de Hospital",
    "admin.users.loading": "A carregar utilizadores...",
    "admin.users.allAssigned":
      "Todos os utilizadores foram atribuídos a hospitais!",
    "admin.users.table.name": "Nome",
    "admin.users.table.email": "Email",
    "admin.users.table.role": "Função",
    "admin.users.table.created": "Criado",
    "admin.users.table.assignHospital": "Atribuir Hospital",
    "admin.forms.sectionTitle":
      "Submissões de Todos os Hospitais - Dados dos Formulários",
    "admin.forms.sectionDesc":
      'Veja todas as submissões de todos os hospitais. Clique em "Ver Relatório" para ver métricas detalhadas.',
    "admin.forms.loading": "A carregar dados dos formulários...",
    "admin.forms.error": "Erro ao carregar dados dos formulários",
    "admin.forms.totals": "Formulários Totais",
    "admin.forms.submitted": "Submetidos",
    "admin.forms.pending": "Pendentes",
    "admin.forms.refresh": "Atualizar",
    "admin.forms.table.hospital": "Hospital",
    "admin.forms.table.deptHead": "Responsável de Departamento",
    "admin.forms.table.monthYear": "Mês/Ano",
    "admin.forms.table.status": "Estado",
    "admin.forms.table.submittedAt": "Submetido Em",
    "admin.forms.table.created": "Criado",
    "admin.forms.table.actions": "Ações",
    "admin.forms.viewReport": "Ver Relatório",
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
