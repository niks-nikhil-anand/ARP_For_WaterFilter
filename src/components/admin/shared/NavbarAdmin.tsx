// components/(Dashboard)/Shared/NavbarAdmin.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Moon, Sun, Menu, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { authActions } from "@/actions";

interface NavbarAdminProps {
  className?: string;
  onToggleSidebar?: () => void;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

const NavbarAdmin: React.FC<NavbarAdminProps> = ({
  className,
  onToggleSidebar,
}) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Add a small delay to ensure cookie is set after signup/login
        await new Promise(resolve => setTimeout(resolve, 300));

        const result = await authActions.getCurrentUser();
        console.log("NavbarAdmin - getCurrentUser result:", result);

        if (result.success && result.data) {
          setUserData(result.data);
        } else {
          // Retry once after a delay before redirecting
          console.log("First auth check failed, retrying...");
          await new Promise(resolve => setTimeout(resolve, 1000));

          const retryResult = await authActions.getCurrentUser();
          console.log("NavbarAdmin - Retry result:", retryResult);

          if (retryResult.success && retryResult.data) {
            setUserData(retryResult.data);
          } else {
            // Only redirect if retry also fails
            console.log("Auth failed, redirecting to login");
            setTimeout(() => {
              router.push("/auth/admin");
            }, 500);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Don't redirect on error, just log it
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleProfile = () => {
    // Implement navigation to profile page
    console.log("Navigate to profile");
    setIsDropdownOpen(false);
  };

  const handleSettings = () => {
    // Navigate to settings page
    router.push("/admin/settings");
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsDropdownOpen(false);
      // Call logout API
      await authActions.logout();
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      // Redirect to home page
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect to home
      router.push("/");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      className={cn(
        "h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 relative z-50",
        className
      )}
    >
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 md:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
            🏢 Samarth Enterprise
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 hidden md:block">
            WaterFilter Management System
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDropdown}
            className="flex items-center space-x-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 px-3 py-2"
          >
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium">
                {loading ? "Loading..." : userData?.name || "User"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {loading ? "" : userData?.role || "Administrator"}
              </span>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              isDropdownOpen ? "rotate-180" : "rotate-0"
            )} />
          </Button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userData?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userData?.email || ""}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={handleProfile}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <User className="h-4 w-4 mr-3" />
                  View Profile
                </button>

                <button
                  onClick={handleSettings}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarAdmin;
