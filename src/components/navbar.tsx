"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface UserAuth {
  id: string;
  email: string;
}

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserAuth | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-base shadow-sm">
            R
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
            ReadLog
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {!loading && user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/reading-logs"
                className="text-sm font-semibold text-primary hover:underline transition-colors"
                data-testid="link-reading-logs"
              >
                Reading Logs
              </Link>

              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
                data-testid="user-email"
              >
                {user.email}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-medium h-8"
                data-testid="btn-logout"
              >
                Logout
              </Button>
            </div>
          ) : !loading ? (
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm" className="hover:text-primary" data-testid="btn-login">
                <Link href="/login">
                  Login
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-[#8F2620]" data-testid="btn-register">
                <Link href="/register">
                  Register
                </Link>
              </Button>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
