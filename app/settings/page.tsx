"use client";

import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Languages,
  Save,
  AlertTriangle,
  Info,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApp } from "@/components/providers/AppProvider";

// Disable static generation for this page
export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const { auth, language } = useApp();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      dueDateReminders: true,
      weeklyReports: false,
    },
    preferences: {
      theme: "light",
      dateFormat: "MM/DD/YYYY",
      timezone: "America/Sao_Paulo",
    },
    profile: {
      name: auth.user?.name || "",
      email: auth.user?.email || "",
      department: "Sustainability Office",
      phone: "+55 11 99999-9999",
    },
  });

  const handleSaveSettings = () => {
    // TODO: Implement settings save functionality
    console.log("Saving settings:", settings);
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <SettingsIcon className="h-8 w-8 mr-3 text-primary" />
          {language.t("nav.settings")}
        </h1>
        <p className="text-gray-600 mt-2">
          {language.language === "en"
            ? "Manage your account settings and preferences."
            : "Gerencie suas configurações de conta e preferências."}
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            {language.language === "en"
              ? "Profile Information"
              : "Informações do Perfil"}
          </CardTitle>
          <CardDescription>
            {language.language === "en"
              ? "Update your personal information and contact details."
              : "Atualize suas informações pessoais e dados de contato."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">
                {language.language === "en" ? "Full Name" : "Nome Completo"}
              </Label>
              <Input
                id="name"
                value={settings.profile.name}
                onChange={(e) =>
                  handleInputChange("profile", "name", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="email">
                {language.language === "en"
                  ? "Email Address"
                  : "Endereço de Email"}
              </Label>
              <Input
                id="email"
                type="email"
                value={settings.profile.email}
                onChange={(e) =>
                  handleInputChange("profile", "email", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="department">
                {language.language === "en" ? "Department" : "Departamento"}
              </Label>
              <Input
                id="department"
                value={settings.profile.department}
                onChange={(e) =>
                  handleInputChange("profile", "department", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="phone">
                {language.language === "en"
                  ? "Phone Number"
                  : "Número de Telefone"}
              </Label>
              <Input
                id="phone"
                value={settings.profile.phone}
                onChange={(e) =>
                  handleInputChange("profile", "phone", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Languages className="h-5 w-5 mr-2" />
            {language.language === "en"
              ? "Language & Region"
              : "Idioma e Região"}
          </CardTitle>
          <CardDescription>
            {language.language === "en"
              ? "Configure your language and regional preferences."
              : "Configure suas preferências de idioma e região."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                {language.language === "en"
                  ? "Interface Language"
                  : "Idioma da Interface"}
              </Label>
              <p className="text-sm text-gray-600">
                {language.language === "en"
                  ? "Choose your preferred language for the interface."
                  : "Escolha seu idioma preferido para a interface."}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">EN</span>
              <Switch
                checked={language.language === "pt"}
                onCheckedChange={() =>
                  language.setLanguage(language.language === "en" ? "pt" : "en")
                }
              />
              <span className="text-sm">PT</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timezone">
                {language.language === "en" ? "Timezone" : "Fuso Horário"}
              </Label>
              <select
                id="timezone"
                value={settings.preferences.timezone}
                onChange={(e) =>
                  handleInputChange("preferences", "timezone", e.target.value)
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                <option value="America/New_York">New York (UTC-5)</option>
                <option value="Europe/London">London (UTC+0)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="dateFormat">
                {language.language === "en" ? "Date Format" : "Formato de Data"}
              </Label>
              <select
                id="dateFormat"
                value={settings.preferences.dateFormat}
                onChange={(e) =>
                  handleInputChange("preferences", "dateFormat", e.target.value)
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            {language.language === "en" ? "Notifications" : "Notificações"}
          </CardTitle>
          <CardDescription>
            {language.language === "en"
              ? "Configure how and when you receive notifications."
              : "Configure como e quando você recebe notificações."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  {language.language === "en"
                    ? "Email Notifications"
                    : "Notificações por Email"}
                </Label>
                <p className="text-sm text-gray-600">
                  {language.language === "en"
                    ? "Receive notifications via email."
                    : "Receba notificações por email."}
                </p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) =>
                  handleInputChange("notifications", "email", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  {language.language === "en"
                    ? "Due Date Reminders"
                    : "Lembretes de Vencimento"}
                </Label>
                <p className="text-sm text-gray-600">
                  {language.language === "en"
                    ? "Get reminded when reports are due."
                    : "Seja lembrado quando relatórios estiverem vencendo."}
                </p>
              </div>
              <Switch
                checked={settings.notifications.dueDateReminders}
                onCheckedChange={(checked) =>
                  handleInputChange(
                    "notifications",
                    "dueDateReminders",
                    checked
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  {language.language === "en"
                    ? "Weekly Reports"
                    : "Relatórios Semanais"}
                </Label>
                <p className="text-sm text-gray-600">
                  {language.language === "en"
                    ? "Receive weekly summary reports."
                    : "Receba relatórios semanais de resumo."}
                </p>
              </div>
              <Switch
                checked={settings.notifications.weeklyReports}
                onCheckedChange={(checked) =>
                  handleInputChange("notifications", "weeklyReports", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            {language.language === "en"
              ? "Security & Privacy"
              : "Segurança e Privacidade"}
          </CardTitle>
          <CardDescription>
            {language.language === "en"
              ? "Manage your account security settings."
              : "Gerencie suas configurações de segurança da conta."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {language.language === "en"
                ? "To change your password or update security settings, please contact your system administrator."
                : "Para alterar sua senha ou atualizar configurações de segurança, entre em contato com o administrador do sistema."}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              {language.language === "en"
                ? "Account Role:"
                : "Função da Conta:"}
            </p>
            <span className="inline-flex px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {auth.user?.role === "admin"
                ? language.language === "en"
                  ? "Administrator"
                  : "Administrador"
                : language.language === "en"
                ? "User"
                : "Usuário"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          {language.language === "en" ? "Save Changes" : "Salvar Alterações"}
        </Button>
      </div>

      {/* TO-DO Features Placeholder */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {language.language === "en"
              ? "Additional Settings Coming Soon"
              : "Configurações Adicionais em Breve"}
          </h3>
          <p className="text-gray-600 mb-4">
            {language.language === "en"
              ? "The following settings features will be implemented:"
              : "Os seguintes recursos de configuração serão implementados:"}
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>
              •{" "}
              {language.language === "en"
                ? "Advanced notification preferences"
                : "Preferências avançadas de notificação"}
            </li>
            <li>
              •{" "}
              {language.language === "en"
                ? "Data export and backup options"
                : "Opções de exportação e backup de dados"}
            </li>
            <li>
              •{" "}
              {language.language === "en"
                ? "Integration with external systems"
                : "Integração com sistemas externos"}
            </li>
            <li>
              •{" "}
              {language.language === "en"
                ? "Custom dashboard layouts"
                : "Layouts personalizados do painel"}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
