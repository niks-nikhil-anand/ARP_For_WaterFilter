"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { authActions } from '@/actions'

const SignUp = () => {
  const router = useRouter()

  // User Information
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [mobile, setMobile] = useState("+91 ")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Handle phone input with +91 prefix
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const prefix = '+91 '
    const raw = e.target.value || ''
    // Extract digits only
    let digits = raw.replace(/\D/g, '')
    // If user pasted full international like '919876543210' or '+919876543210', strip leading country code
    if (digits.startsWith('91')) {
      digits = digits.replace(/^91/, '')
    }
    // Limit to 10 digits
    digits = digits.slice(0, 10)
    setMobile(prefix + digits)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields!")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long!")
      return
    }

    setIsSubmitting(true)

    // Normalize and validate phone: extract digits and ensure 10-digit local number
    const allDigits = mobile.replace(/\D/g, '')
    const localDigits = allDigits.replace(/^91/, '')

    // Validate mobile if provided
    if (mobile.trim() !== '+91' && localDigits.length !== 10) {
      setError('Please enter a valid 10-digit phone number or leave it empty.')
      setIsSubmitting(false)
      return
    }

    try {
      // Call signup API with SUPERADMIN role
      const result = await authActions.signup({
        name,
        email,
        password,
        mobile: localDigits.length === 10 ? `+91${localDigits}` : undefined,
        role: 'SUPERADMIN'
      })

      if (result.success) {
        setSuccess("Account created successfully! Redirecting to sign in...")

        // Reset form
        setName("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setMobile("+91 ")

        // Redirect to sign-in page after 2 seconds
        setTimeout(() => {
          router.push('/auth/sign-in')
        }, 2000)
      } else {
        setError(result.error || "Failed to create account. Please try again.")
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8'>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Super Admin Account
          </CardTitle>
          <CardDescription className="text-center">
            Sign up for a Super Admin account to manage the entire system
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

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Mobile */}
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={mobile}
                onChange={handlePhoneChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Super Admin Account"
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <a href="/auth/sign-in" className="text-primary hover:underline">
              Sign In
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignUp
