"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || "Registration failed");
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-10">
      <Card className="w-full max-w-md shadow-md border-border bg-white" data-testid="register-card">
        <CardHeader className="space-y-1.5 text-center pb-4">
          <div className="mx-auto w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary font-black text-xl mb-1">
            V
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Đăng ký tài khoản
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Tạo tài khoản mới để trải nghiệm đầy đủ chức năng
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div
                className="p-3 text-xs rounded-lg bg-red-50 text-destructive border border-red-200 font-medium"
                data-testid="error-message"
              >
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-foreground">Họ và tên</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-input focus-visible:ring-primary h-10 text-sm"
                data-testid="name-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-input focus-visible:ring-primary h-10 text-sm"
                data-testid="email-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-input focus-visible:ring-primary h-10 text-sm"
                data-testid="password-input"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-[#8F2620] text-primary-foreground font-semibold shadow-sm h-10"
              disabled={loading}
              data-testid="register-button"
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-primary font-bold hover:underline"
                data-testid="login-link"
              >
                Đăng nhập tại đây
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
