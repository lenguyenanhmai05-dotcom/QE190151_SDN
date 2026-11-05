import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SDN Project - Next.js & Supabase",
  description: "Next.js App Router with Prisma, Supabase PostgreSQL and Authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="font-bold text-lg tracking-tight hover:opacity-80">
              SDN App
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link
                href="/"
                className="text-slate-600 hover:text-slate-900 transition-colors"
                data-testid="nav-home"
              >
                Home
              </Link>
              <Link
                href="/login"
                className="text-slate-600 hover:text-slate-900 transition-colors"
                data-testid="nav-login"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-primary text-primary-foreground px-3.5 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                data-testid="nav-register"
              >
                Register
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t bg-white py-6 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} SDN Project. Built with Next.js, Prisma, and Supabase.</p>
        </footer>
      </body>
    </html>
  );
}

