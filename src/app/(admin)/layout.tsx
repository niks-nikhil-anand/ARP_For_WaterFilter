// app/admin/layout.tsx
"use client";

import React, { ReactNode, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import SidebarAdmin from "@/components/admin/shared/SidebarAdmin";
import NavbarAdmin from "@/components/admin/shared/NavbarAdmin";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex w-full min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <SidebarAdmin 
          className={`
            ${sidebarCollapsed ? 'w-16' : 'w-64'} 
            transition-all duration-300 ease-in-out
            hidden md:flex
          `}
        />

        {/* Mobile Sidebar Overlay */}
        <div className="md:hidden">
          <SidebarAdmin 
            className={`
              fixed inset-y-0 left-0 z-50 w-64
              transform transition-transform duration-300 ease-in-out
              ${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}
            `}
          />
          {!sidebarCollapsed && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarCollapsed(true)}
            />
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <NavbarAdmin 
            className="w-full flex-shrink-0"
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          
          <main className="flex-1 p-6 overflow-auto bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AdminLayout;
