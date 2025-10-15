// components/(Dashboard)/Shared/SidebarAdmin.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  Store,
  ShoppingCart,
  ShieldCheck,
  Wrench,
  Building2,
  Shield,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SidebarAdminProps {
  className?: string;
}

const SidebarAdmin: React.FC<SidebarAdminProps> = ({ className }) => {
  const menuSections = [
    {
      title: "Overview",
      items: [{ icon: LayoutDashboard, label: "Dashboard", href: "/admin" }],
    },
    {
      title: "Management",
      items: [
        { icon: Users, label: "Users", href: "/admin/user_details" },
        { icon: Building2, label: "Agencies", href: "/admin/agency_details" },
        { icon: Package, label: "Products", href: "/admin/product_details" },
        { icon: Store, label: "Shops", href: "/admin/shop_details" },
        { icon: ShoppingCart, label: "Orders", href: "/admin/order_details" },
      ],
    },
    {
      title: "Services",
      items: [
        {
          icon: ShieldCheck,
          label: "Warranties",
          href: "/admin/warranty_details",
        },
        {
          icon: Wrench,
          label: "Repair Requests",
          href: "/admin/repair_requests",
        },
      ],
    },
    {
      title: "System",
      items: [{ icon: Settings, label: "Settings", href: "/admin/settings" }],
    },
  ];

  const handleLogout = async () => {
    try {
      console.log("Logging out...");

      const response = await fetch("/api/auth/log-out", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Logout successful:", data.message);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        console.error("❌ Logout failed:", errorData.message);
      }
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  return (
    <aside
      className={cn(
        "w-64 h-screen bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Admin Panel
            </h2>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {menuSections.map((section, i) => (
          <div className="mb-6" key={i}>
            {section.title && (
              <div className="mb-2 px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {section.title}
              </div>
            )}
            <ul className="space-y-1">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index}>
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 cursor-pointer transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;
