import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <div className="text-center space-y-3 max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl" data-testid="page-title">
          SDN Next.js & Supabase Project
        </h1>
        <p className="text-lg text-slate-600">
          App Router, TypeScript, Prisma ORM, PostgreSQL on Supabase, and custom email/password authentication.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-md" data-testid="auth-status-card">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>
            {user ? "You are currently logged in." : "You are not logged in."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-3">
              <div className="p-3 bg-slate-100 rounded-md text-sm space-y-1">
                <p>
                  <strong className="text-slate-700">Email:</strong>{" "}
                  <span data-testid="user-email">{user.email}</span>
                </p>
                {user.name && (
                  <p>
                    <strong className="text-slate-700">Name:</strong>{" "}
                    <span data-testid="user-name">{user.name}</span>
                  </p>
                )}
                <p>
                  <strong className="text-slate-700">Role:</strong>{" "}
                  <span data-testid="user-role">{user.role}</span>
                </p>
              </div>

              <form action="/api/auth/logout" method="POST">
                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full"
                  data-testid="logout-button"
                >
                  Log Out
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button asChild className="flex-1" data-testid="home-login-button">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1" data-testid="home-register-button">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

