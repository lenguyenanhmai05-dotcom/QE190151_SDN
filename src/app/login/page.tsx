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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorAuth, setErrorAuth] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getEmailError = (val: string) => {
    if (!val || !val.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return "Please enter a valid email address";
    return "";
  };

  const getPasswordError = (val: string) => {
    if (!val) return "Password is required";
    return "";
  };

  const emailError = getEmailError(email);
  const passwordError = getPasswordError(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setErrorAuth(null);

    if (emailError || passwordError) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorAuth(data.error || "Invalid email or password");
      } else {
        // On success, goes to /reading-logs
        window.location.href = "/reading-logs";
      }
    } catch {
      setErrorAuth("Network error during login");
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
            Sign In
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Enter your email and password to access your Reading Logs
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate data-testid="login-form">
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
                data-testid="login-email"
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
                data-testid="login-password"
              />
              {hasSubmitted && passwordError && (
                <p className="text-xs text-destructive font-medium mt-1" data-testid="error-password">
                  {passwordError}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-[#8F2620] text-primary-foreground font-semibold shadow-sm h-10"
              disabled={loading}
              data-testid="login-submit"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Register here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
