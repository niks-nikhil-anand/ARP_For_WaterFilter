'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2, Shield, Crown, Store } from 'lucide-react'
import { authActions } from '@/actions'

const AdminLogin = () => {
  const router = useRouter()
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      // Validate inputs
      if (!role) {
        setError('Please select your role')
        return
      }

      if (!email || !password) {
        setError('Please enter both email and password')
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address')
        return
      }

      // Call login API through server action
      const result = await authActions.login({
        email: email.trim(),
        password: password,
      })

      if (result.success) {
        // Get user data from result
        const user = result.data?.user

        if (!user) {
          setError('Login failed. User data not found.')
          return
        }

        // Verify the user's role matches the selected role
        if (role === 'superadmin' && user.role !== 'SUPERADMIN') {
          setError('Access denied. You do not have Super Admin privileges.')
          await authActions.logout()
          return
        }

        if (role === 'admin' && user.role !== 'ADMIN') {
          setError('Access denied. You do not have Admin privileges.')
          await authActions.logout()
          return
        }

        // Success message
        setSuccess(`Login successful! Redirecting to ${role === 'superadmin' ? 'admin panel' : 'shop dashboard'}...`)

        // Store user data if remember me is checked
        if (rememberMe) {
          localStorage.setItem('adminEmail', email)
          localStorage.setItem('adminRole', role)
        } else {
          localStorage.removeItem('adminEmail')
          localStorage.removeItem('adminRole')
        }

        // Redirect based on role
        setTimeout(() => {
          if (role === 'superadmin') {
            router.push('/admin')
          } else if (role === 'admin') {
            router.push('/shop')
          }
          router.refresh()
        }, 1000)
      } else {
        setError(result.error || 'Login failed. Please check your credentials.')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Load saved credentials on component mount
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('adminEmail')
    const savedRole = localStorage.getItem('adminRole')
    if (savedEmail && savedRole) {
      setEmail(savedEmail)
      setRole(savedRole)
      setRememberMe(true)
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Admin Panel Login
          </CardTitle>
          <CardDescription>
            Select your role and enter credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error/Success Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Select Role *</Label>
              <Select value={role} onValueChange={setRole} disabled={isSubmitting}>
                <SelectTrigger id="role" className="h-11">
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-600" />
                      <span>Super Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-blue-600" />
                      <span>Admin (Shop Owner)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {role === 'superadmin' && '→ Redirects to /admin (Full system access)'}
                {role === 'admin' && '→ Redirects to /shop (Shop management)'}
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
                required
                className="h-11"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                autoComplete="current-password"
                required
                className="h-11"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 space-y-2">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium mb-2">Role Descriptions:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <Crown className="h-3 w-3 mt-0.5 text-purple-600 flex-shrink-0" />
                  <span><strong>Super Admin:</strong> Full system access, manage all shops, users, and settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Store className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span><strong>Admin:</strong> Manage your shop, products, orders, and agents</span>
                </li>
              </ul>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              This is a secure admin area. Only authorized personnel can access this panel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminLogin
