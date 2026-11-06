"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorAuth, setErrorAuth] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Compute live validation errors
  const getEmailError = (val: string) => {
    if (!val || !val.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return "Please enter a valid email address";
    return "";
  };

  const getPasswordError = (val: string) => {
    if (!val) return "Password is required";
    if (val.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const getConfirmPasswordError = (val: string, pwd: string) => {
    if (!val) return "Confirm password is required";
    if (val !== pwd) return "Passwords do not match";
    return "";
  };

  const emailError = getEmailError(email);
  const passwordError = getPasswordError(password);
  const confirmPasswordError = getConfirmPasswordError(confirmPassword, password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setErrorAuth(null);
    setFormSuccess(null);

    // If any validation error, do not submit
    if (emailError || passwordError || confirmPasswordError) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorAuth(data.error || "Registration failed");
      } else {
        setFormSuccess("Registration successful");
        // Clear inputs after success
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setHasSubmitted(false);
      }
    } catch {
      setErrorAuth("Network error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-10">
      <Card className="w-full max-w-md shadow-md border-border bg-white">
        <CardHeader className="space-y-1.5 text-center pb-4">
          <div className="mx-auto w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary font-black text-xl mb-1">
            R
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Create an Account
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Enter your details to register for ReadLog
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate data-testid="register-form">
          <CardContent className="space-y-4">
            {/* Global API Auth Error */}
            {errorAuth && (
              <div
                className="p-3 text-xs rounded-lg bg-red-50 text-destructive border border-red-200 font-medium"
                data-testid="error-auth"
              >
                {errorAuth}
              </div>
            )}

            {/* Form Success Message */}
            {formSuccess && (
              <div
                className="p-3 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium"
                data-testid="form-success"
              >
                {formSuccess}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorAuth(null);
                }}
                className="border-input focus-visible:ring-primary h-10 text-sm"
                data-testid="register-email"
              />
              {hasSubmitted && emailError && (
                <p className="text-xs text-destructive font-medium mt-1" data-testid="error-email">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorAuth(null);
                }}
                className="border-input focus-visible:ring-primary h-10 text-sm"
                data-testid="register-password"
              />
              {hasSubmitted && passwordError && (
                <p className="text-xs text-destructive font-medium mt-1" data-testid="error-password">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorAuth(null);
                }}
                className="border-input focus-visible:ring-primary h-10 text-sm"
                data-testid="register-confirm-password"
              />
              {hasSubmitted && confirmPasswordError && (
                <p
                  className="text-xs text-destructive font-medium mt-1"
                  data-testid="error-confirm-password"
                >
                  {confirmPasswordError}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-[#8F2620] text-primary-foreground font-semibold shadow-sm h-10"
              disabled={loading}
              data-testid="register-submit"
            >
              {loading ? "Registering..." : "Register"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Login here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
