import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "SDN Project - Red Velvet",
  description: "Next.js App Router with Prisma, Supabase PostgreSQL and Authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-background text-foreground flex flex-col selection:bg-secondary selection:text-primary">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-border bg-white/60 py-6 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SDN Project. Built with Next.js, Prisma, and Supabase.</p>
        </footer>
      </body>
    </html>
  );
}
