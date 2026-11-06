import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { ReadingLogProvider } from "@/context/ReadingLogContext";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ReadLog - Track Your Reading Sessions",
  description: "A web app to track reading sessions, minutes read, and statistics by genre.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground flex flex-col selection:bg-secondary selection:text-primary">
        <ReadingLogProvider>
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="border-t border-border bg-white/60 py-6 text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} ReadLog. Built with Next.js, Prisma, and Supabase.</p>
          </footer>
        </ReadingLogProvider>
      </body>
    </html>
  );
}
