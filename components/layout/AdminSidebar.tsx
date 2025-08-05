"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/button";
import {
  HomeIcon,
  Upload,
  BarChart3,
  BellIcon,
  CogIcon,
  HelpCircle,
  LogOut,
  MessageCircle,
} from "lucide-react";

const menu = [
  { href: "/admin/dashboard", label: "menu.dashboard", icon: HomeIcon },
  { href: "/admin/data-analysis", label: "menu.dataAnalysis", icon: BarChart3 },
  { href: "/admin/file-upload", label: "menu.fileUpload", icon: Upload },
  { href: "/admin/notifications", label: "menu.notifications", icon: BellIcon },
  {
    href: "/admin/support-messages",
    label: "menu.supportMessages",
    icon: MessageCircle,
  },
];

const others = [
  { href: "/admin/settings", label: "menu.settings", icon: CogIcon },
  { href: "/admin/contact", label: "menu.contact", icon: HelpCircle },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();
  const { language } = useApp();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="w-60 bg-gray-50 p-4 flex flex-col">
      <div className="text-lg font-bold text-gray-900 mb-6">
        {language.t("dashboard.admin")}
      </div>

      <div className="flex-1">
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">{language.t("menu")}</div>
          <div className="space-y-1">
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-2 py-2 w-full rounded-md text-sm transition-colors",
                  pathname === item.href
                    ? "bg-[#225384]/10 text-[#225384]"
                    : "text-gray-700 hover:bg-[#225384]/5 hover:text-[#225384]"
                )}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {language.t(item.label)}
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">
            {language.t("others")}
          </div>
          <div className="space-y-1">
            {others.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-2 py-2 w-full rounded-md text-sm transition-colors",
                  pathname === item.href
                    ? "bg-[#225384]/10 text-[#225384]"
                    : "text-gray-700 hover:bg-[#225384]/5 hover:text-[#225384]"
                )}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {language.t(item.label)}
              </Link>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full flex items-center justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {language.t("logout")}
          </Button>
        </div>
      </div>
    </div>
  );
}
