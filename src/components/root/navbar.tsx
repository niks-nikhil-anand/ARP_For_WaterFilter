"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Menu, X } from "lucide-react"; // You can use any icon library

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="w-full border-b bg-background shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg text-primary">
          Samarth Enterprise
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/shop">
            <Button variant="ghost" size="sm">Shop</Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">Admin</Button>
          </Link>
          <Link href="/agent">
            <Button variant="ghost" size="sm">Agent</Button>
          </Link>
        </div>

        {/* Right side buttons (auth + theme) */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/sign-in">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button variant="default" size="sm">Sign Up</Button>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "🌙" : "☀️"}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-700 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link href="/shop">
            <Button variant="ghost" className="w-full justify-start">Shop</Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="w-full justify-start">Admin</Button>
          </Link>
          <Link href="/agent">
            <Button variant="ghost" className="w-full justify-start">Agent</Button>
          </Link>
          <Link href="/auth/sign-in">
            <Button variant="outline" className="w-full justify-start">Sign In</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button variant="default" className="w-full justify-start">Sign Up</Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </Button>
        </div>
      )}
    </nav>
  );
}
