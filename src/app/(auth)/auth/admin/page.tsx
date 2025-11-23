"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { login, logout } from "@/actions/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
  Crown,
  Store,
  Eye,
  EyeOff,
} from "lucide-react";

const AdminLoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      // Validate role selection
      if (!role) {
        setError("Please select your role");
        setIsSubmitting(false);
        return;
      }

      // Validate email and password
      if (!email || !password) {
        setError("Please enter both email and password");
        setIsSubmitting(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }

      // Call login server action
      const result = await login({
        email: email.trim(),
        password: password,
      });

      if (!result.success) {
        setError(result.error || "Login failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const user = result.data?.user;

      if (!user) {
        setError("Login failed. User data not found.");
        setIsSubmitting(false);
        return;
      }

      // Role-based access control
      // SUPERADMIN can access both super admin and admin panels
      if (role === "superadmin" && user.role !== "SUPERADMIN") {
        setError("Access denied. You do not have Super Admin privileges.");
        await logout();
        setIsSubmitting(false);
        return;
      }

      if (
        role === "admin" &&
        user.role !== "ADMIN" &&
        user.role !== "SUPERADMIN"
      ) {
        setError("Access denied. You do not have Admin privileges.");
        await logout();
        setIsSubmitting(false);
        return;
      }

      // Success - store remember me preferences
      if (rememberMe) {
        localStorage.setItem("adminEmail", email);
        localStorage.setItem("adminRole", role);
      } else {
        localStorage.removeItem("adminEmail");
        localStorage.removeItem("adminRole");
      }

      setSuccess(
        `Login successful! Redirecting to ${
          role === "superadmin" ? "admin panel" : "shop dashboard"
        }...`
      );

      // Get redirect URL from query params (set by middleware)
      const redirectUrl = searchParams.get("redirect");

      // Redirect based on role or to the original requested page
      setTimeout(() => {
        if (redirectUrl && redirectUrl !== "/auth/admin") {
          window.location.href = redirectUrl;
        } else if (role === "superadmin") {
          window.location.href = "/admin";
        } else if (role === "admin") {
          window.location.href = "/shop";
        }
      }, 1000);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Load saved credentials and handle middleware redirects
  useEffect(() => {
    const savedEmail = localStorage.getItem("adminEmail");
    const savedRole = localStorage.getItem("adminRole");
    if (savedEmail && savedRole) {
      setEmail(savedEmail);
      setRole(savedRole);
      setRememberMe(true);
    }

    // Handle error messages from middleware
    const errorParam = searchParams.get("error");
    const messageParam = searchParams.get("message");

    if (errorParam) {
      const errorMessages: Record<string, string> = {
        authentication_required: "Please login to access this page",
        invalid_token: "Your session has expired. Please login again",
        access_denied: messageParam || "You don't have permission to access this page",
        authentication_error: "Authentication error. Please login again",
      };

      setError(errorMessages[errorParam] || "Please login to continue");
    }
  }, [searchParams]);

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
              <Select
                value={role}
                onValueChange={setRole}
                disabled={isSubmitting}
              >
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isSubmitting}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
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

          {/* Sign Up Link */}
          <div className="mt-6">
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a
                href="/auth/admin/signup"
                className="text-primary hover:underline font-medium"
              >
                Create Account
              </a>
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-4 space-y-2">
            <p className="text-xs text-center text-muted-foreground">
              This is a secure admin area. Only authorized personnel can access
              this panel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminLogin = () => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  }>
    <AdminLoginContent />
  </Suspense>
);

export default AdminLogin;
