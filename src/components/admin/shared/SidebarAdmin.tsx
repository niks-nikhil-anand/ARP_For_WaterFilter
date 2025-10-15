// components/(Dashboard)/Shared/SidebarAdmin.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Layout,
  TrendingUp,
  FolderOpen,
  FileText,
  LogOut,
  Settings,
  Users,
  User,
  ShoppingCart,
  Package,
  Store,
  BadgeCheck,
  Shield,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SidebarAdminProps {
  className?: string;
}

const SidebarAdmin: React.FC<SidebarAdminProps> = ({ className }) => {
  const menuSections = [
    {
      items: [
        { icon: Layout, label: "Dashboard", href: "/admin" },
        { icon: User, label: "User", href: "/admin/user_details" },
        { icon: User, label: "Agent", href: "/admin/user_details" },
        { icon: Package, label: "Product", href: "/admin/product_details" },
        { icon: Store, label: "Shop", href: "/admin/shop_details" },
        { icon: ShoppingCart, label: "Order", href: "/admin/order_details" },
      ]
    },
    {
      title: "Services",
      items: [
        { icon: FolderOpen, label: "Warranty", href: "/admin/warranty_details" },
        { icon: FileText, label: "Repair Requests", href: "/repair_requests" },
      ]
    },
    {
      title: "Settings",
      items: [
        { icon: Settings, label: "Settings", href: "/admin/settings" },
        { icon: UserCog, label: "Role Management", href: "/admin/roles" }
      ]
    }
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
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          Admin Panel
        </h2>
      </div>

      <nav className="flex-1 p-4">
        {menuSections.map((section, i) => (
          <div className={section.title ? "mb-6" : ""} key={i}>
            {section.title && (
              <div className="mb-2 mt-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {section.title}
              </div>
            )}
            <ul className="space-y-2">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index}>
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer"
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


      <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 cursor-pointer"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;
