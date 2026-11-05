import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/95 backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(173,48,41,0.06)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-base shadow-sm group-hover:scale-105 transition-transform">
            V
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
            Velvet App
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-3 py-1.5 rounded-md hover:bg-muted/60"
            data-testid="nav-home"
          >
            Trang chủ
          </Link>

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-border">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-secondary text-secondary-foreground text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span data-testid="nav-user-name">{user.name || user.email}</span>
              </div>

              <form action="/api/auth/logout" method="POST">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-medium h-8"
                  data-testid="nav-logout-button"
                >
                  Đăng xuất
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="hover:text-primary hover:bg-muted">
                <Link href="/login" data-testid="nav-login">
                  Đăng nhập
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-[#8F2620] shadow-sm">
                <Link href="/register" data-testid="nav-register">
                  Đăng ký
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

