'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  TrendingUp
} from 'lucide-react'
import { getCurrentUser, logoutUser } from '@/app/actions/shopActions'
import { toast } from 'sonner'

const ShopSidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [shopName, setShopName] = useState("Samarth Enterprise")
  const [ownerName, setOwnerName] = useState("")
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const fetchUser = async () => {
      console.log("🔍 Fetching user data...")
      const result = await getCurrentUser()
      console.log("📦 Result from getCurrentUser:", result)
      
      if (result.success && result.data) {
        console.log("✅ User data received:", result.data)
        console.log("👤 Name from result:", result.data.name)
        setCurrentUser(result.data)
        setOwnerName(result.data.name)
        setShopName("Samarth Enterprise") // TODO: Fetch actual shop name from database
      } else {
        console.log("❌ Failed to get user:", result.error)
      }
    }
    fetchUser()
  }, [])

  // Prevent hydration mismatch by not rendering user-specific content until mounted
  if (!mounted) {
    return null
  }

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') {
      return 'U'
    }
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  const handleLogout = async () => {
    try {
      const result = await logoutUser()
      
      if (result.success) {
        toast.success("Logged out successfully")
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = "/auth/admin"
      } else {
        toast.error(result.error || "Failed to logout")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("An error occurred during logout")
    }
  }

  const navItems = [
    {
      name: 'Dashboard',
      href: '/shop',
      icon: LayoutDashboard,
      description: 'Overview & Statistics'
    },
    {
      name: 'Products',
      href: '/shop/products',
      icon: Package,
      description: 'Manage Inventory'
    },
    {
      name: 'Orders',
      href: '/shop/orders',
      icon: ShoppingCart,
      description: 'Order Management'
    },
    {
      name: 'Customers',
      href: '/shop/customers',
      icon: Users,
      description: 'Customer Database'
    },
    {
      name: 'Reports',
      href: '/shop/reports',
      icon: TrendingUp,
      description: 'Sales & Analytics'
    },
    {
      name: 'Invoices',
      href: '/shop/invoices',
      icon: FileText,
      description: 'Billing & Invoices'
    }
  ]

  const isActive = (href) => {
    if (href === '/shop') {
      return pathname === '/shop'
    }
    return pathname?.startsWith(href)
  }

  const SidebarContent = () => (
    <>
      {/* Shop Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-600 dark:bg-blue-500 p-3 rounded-lg">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{shopName}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Shop Owner</p>
          </div>
        </div>

        {/* Owner Profile */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Avatar className="h-10 w-10 bg-blue-600 dark:bg-blue-500">
            <AvatarFallback className="bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm">
              {getInitials(ownerName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {ownerName || "Loading..."}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-white' : ''}`} />
                <div className="flex-1">
                  <p className={`font-medium text-sm ${active ? 'text-white' : ''}`}>
                    {item.name}
                  </p>
                  <p className={`text-xs ${active ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {item.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/shop/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <Settings className="h-5 w-5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Settings</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Shop Configuration</p>
            </div>
          </Link>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-lg text-gray-900 dark:text-white">{shopName}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transform transition-transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-lg text-gray-900 dark:text-white">{shopName}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex flex-col h-[calc(100%-4rem)]">
          <SidebarContent />
        </div>
      </aside>
    </>
  )
}

export default ShopSidebar
