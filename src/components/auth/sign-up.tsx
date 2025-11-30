"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/actions/auth";
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
    UserPlus,
    Eye,
    EyeOff,
} from "lucide-react";

const SignUp = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("+91 ");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Handle phone input with +91 prefix
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const prefix = "+91 ";
        const raw = e.target.value || "";
        // Extract digits only
        let digits = raw.replace(/\D/g, "");
        // If user pasted full international like '919876543210' or '+919876543210', strip leading country code
        if (digits.startsWith("91")) {
            digits = digits.replace(/^91/, "");
        }
        // Limit to 10 digits
        digits = digits.slice(0, 10);
        setMobile(prefix + digits);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        try {
            // Validate inputs
            if (!name || !email || !password || !confirmPassword) {
                setError("Please fill in all required fields");
                return;
            }

            // Name validation
            if (name.trim().length < 2) {
                setError("Name must be at least 2 characters long");
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError("Please enter a valid email address");
                return;
            }

            // Mobile validation (optional but if provided, must be valid)
            const allDigits = mobile.replace(/\D/g, "");
            const localDigits = allDigits.replace(/^91/, "");

            if (mobile.trim() !== "+91" && localDigits.length !== 10) {
                setError(
                    "Please enter a valid 10-digit mobile number or leave it empty"
                );
                return;
            }

            // Password validation
            if (password.length < 6) {
                setError("Password must be at least 6 characters long");
                return;
            }

            // Password match validation
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                return;
            }

            // Call signup server action - default role is USER
            const result = await signup({
                name: name.trim(),
                email: email.trim(),
                password: password,
                mobile: localDigits.length === 10 ? `+91${localDigits}` : undefined,
            });

            if (result.success) {
                setSuccess("Account created successfully! Redirecting to login...");

                // Redirect to login page after successful signup
                setTimeout(() => {
                    window.location.href = "/auth/login"; // Assuming generic login page exists, or redirect to home
                }, 1500);
            } else {
                setError(result.error || "Signup failed. Please try again.");
            }
        } catch (error: any) {
            console.error("Signup error:", error);
            setError(
                error.message || "An unexpected error occurred. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-3 text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <UserPlus className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription>
                        Sign up to get started with our services
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
                                autoComplete="name"
                                required
                                className="h-11"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                autoComplete="email"
                                required
                                className="h-11"
                            />
                        </div>

                        {/* Mobile */}
                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number (Optional)</Label>
                            <Input
                                id="mobile"
                                type="tel"
                                placeholder="+91 XXXXX XXXXX"
                                value={mobile}
                                onChange={handlePhoneChange}
                                disabled={isSubmitting}
                                autoComplete="tel"
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
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    autoComplete="new-password"
                                    required
                                    className={`h-11 pr-10 ${password && password.length < 6
                                            ? "border-red-500 focus-visible:ring-red-500"
                                            : ""
                                        }`}
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
                            {password && password.length < 6 ? (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Password must be at least 6 characters long
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Password must be at least 6 characters long
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    autoComplete="new-password"
                                    required
                                    className={`h-11 pr-10 ${confirmPassword && password !== confirmPassword
                                            ? "border-red-500 focus-visible:ring-red-500"
                                            : confirmPassword &&
                                                password === confirmPassword &&
                                                password.length >= 6
                                                ? "border-green-500 focus-visible:ring-green-500"
                                                : ""
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    disabled={isSubmitting}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {confirmPassword && password !== confirmPassword ? (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Passwords do not match
                                </p>
                            ) : confirmPassword &&
                                password === confirmPassword &&
                                password.length >= 6 ? (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Passwords match
                                </p>
                            ) : null}
                        </div>

                        {/* Sign Up Button */}
                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Create Account
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Sign In Link */}
                    <div className="mt-6">
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <a
                                href="/auth/login"
                                className="text-primary hover:underline font-medium"
                            >
                                Sign In
                            </a>
                        </p>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 space-y-2">
                        <p className="text-xs text-center text-muted-foreground">
                            By creating an account, you agree to our terms and conditions
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SignUp;
