'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Wrench,
  LayoutDashboard,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { logoutAgent } from '@/actions/agent/auth'

const AgentNavbar = ({ agentName = "Rajesh Kumar" }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notificationCount] = useState(3)

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await logoutAgent()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navItems = [
    {
      name: 'Dashboard',
      href: '/agent',
      icon: LayoutDashboard
    },
    {
      name: 'Analytics',
      href: '/agent/analytics',
      icon: BarChart3
    },
    {
      name: 'Notifications',
      href: '/agent/notifications',
      icon: Bell
    }
  ]

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Agent Portal
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Samarth Enterprise
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Right Side - Notifications and Profile */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notifications */}
            <Link href="/agent/notifications">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {agentName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Field Agent
                </p>
              </div>
              <Avatar className="h-10 w-10 bg-blue-600 dark:bg-blue-500">
                <AvatarFallback className="bg-blue-600 dark:bg-blue-500 text-white font-semibold">
                  {getInitials(agentName)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-4 py-4 space-y-3">
            {/* Profile Section */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
              <Avatar className="h-12 w-12 bg-blue-600 dark:bg-blue-500">
                <AvatarFallback className="bg-blue-600 dark:bg-blue-500 text-white font-semibold">
                  {getInitials(agentName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {agentName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Field Agent
                </p>
              </div>
            </div>

            {/* Navigation Items */}
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}

            {/* Notifications */}
            <Link
              href="/agent/notifications"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between w-full px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5" />
                <span className="font-medium">Notifications</span>
              </div>
              {notificationCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {notificationCount}
                </Badge>
              )}
            </Link>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default AgentNavbar
