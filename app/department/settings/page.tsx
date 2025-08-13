"use client";

import React from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Cog, Bell, Shield, User } from "lucide-react";

export default function DepartmentSettings() {
  const { language } = useApp();
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {language.t("dept.settings.title")}
        </h1>
        <p className="text-gray-600 mt-2">
          {language.t("dept.settings.subtitle")}
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{language.t("dept.settings.profile")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {language.t("dept.settings.fullName")}
              </Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{language.t("dept.help.email")}</Label>
              <Input
                id="email"
                type="email"
                defaultValue="john.doe@hospital.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hospital">
                {language.t("dept.settings.hospital")}
              </Label>
              <Input id="hospital" defaultValue="Central Hospital" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">
                {language.t("dept.settings.department")}
              </Label>
              <Input id="department" defaultValue="Emergency" />
            </div>
          </div>
          <Button>{language.t("buttons.saveChanges")}</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>{language.t("dept.settings.notifications")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">
                {language.t("dept.settings.emailNotifications")}
              </Label>
              <p className="text-sm text-gray-600">
                {language.t("dept.notifications.emailDesc")}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">
                {language.t("dept.settings.reportReminders")}
              </Label>
              <p className="text-sm text-gray-600">
                {language.t("dept.notifications.remindersDesc")}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">
                {language.t("dept.settings.dataUpdates")}
              </Label>
              <p className="text-sm text-gray-600">
                {language.t("dept.settings.dataUpdatesDesc")}
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>{language.t("dept.settings.security")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">
              {language.t("dept.settings.currentPassword")}
            </Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">
              {language.t("dept.settings.newPassword")}
            </Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">
              {language.t("dept.settings.confirmPassword")}
            </Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button variant="outline">
            {language.t("buttons.changePassword")}
          </Button>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cog className="h-5 w-5" />
            <span>{language.t("dept.settings.system")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">
                {language.t("dept.settings.autoSaveDrafts")}
              </Label>
              <p className="text-sm text-gray-600">
                {language.t("dept.settings.autoSaveDraftsDesc")}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">
                {language.t("dept.settings.dataExport")}
              </Label>
              <p className="text-sm text-gray-600">
                {language.t("dept.settings.dataExportDesc")}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">
                {language.t("dept.settings.analytics")}
              </Label>
              <p className="text-sm text-gray-600">
                {language.t("dept.settings.analyticsDesc")}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
