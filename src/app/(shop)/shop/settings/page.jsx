'use client'

import ShopSidebar from '@/components/shop/ShopSidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Store, Bell, Shield, Palette, Save } from 'lucide-react'

const SettingsPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <ShopSidebar />
      <main className="flex-1 lg:ml-80 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Configure your shop preferences</p>
          </div>

          {/* Shop Information */}
          <Card className="dark:bg-gray-900 dark:border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                <Store className="h-5 w-5" />
                Shop Information
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Update your shop details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="dark:text-white">Shop Name</Label>
                  <Input defaultValue="Samarth Enterprise" className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
                <div>
                  <Label className="dark:text-white">Owner Name</Label>
                  <Input defaultValue="Ramesh Kumar" className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
                <div>
                  <Label className="dark:text-white">Email</Label>
                  <Input type="email" defaultValue="shop@samarthenterprise.com" className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
                <div>
                  <Label className="dark:text-white">Phone</Label>
                  <Input defaultValue="+91 98765 43210" className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
                <div className="col-span-2">
                  <Label className="dark:text-white">Address</Label>
                  <Textarea defaultValue="123, Main Market, Bangalore - 560001" className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" rows={3} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="dark:bg-gray-900 dark:border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Manage notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Order Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about new orders</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Low Stock Alerts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Alerts when inventory is low</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Payment Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Payment received alerts</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="dark:bg-gray-900 dark:border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Manage security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="dark:text-white">Current Password</Label>
                <Input type="password" className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </div>
              <div>
                <Label className="dark:text-white">New Password</Label>
                <Input type="password" className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </div>
              <div>
                <Label className="dark:text-white">Confirm New Password</Label>
                <Input type="password" className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </div>
              <Button variant="outline" className="dark:border-gray-700">Change Password</Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage
