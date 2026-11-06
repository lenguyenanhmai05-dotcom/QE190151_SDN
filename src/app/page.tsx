import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-10 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-2xl px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary border border-secondary text-secondary-foreground text-xs font-bold tracking-wider uppercase">
          Track Your Reading Journey
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground" data-testid="home-title">
          ReadLog
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
          Track your personal reading sessions: which book, how many minutes, what genre, and when. Keep favorite sessions bookmarked and view live summaries by genre.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-[#8F2620] text-primary-foreground font-semibold px-8 shadow-md">
            <Link href="/reading-logs">
              Go to Reading Logs
            </Link>
          </Button>
        </div>
      </div>

      {/* At least three feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
        <Card className="border-border bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary font-bold text-lg mb-2">
              📖
            </div>
            <CardTitle className="text-lg font-bold text-foreground">
              Log every session
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Record book titles, reading duration in minutes, notes, and session dates with ease.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary font-bold text-lg mb-2">
              🏷️
            </div>
            <CardTitle className="text-lg font-bold text-foreground">
              Sort by genre
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Filter by Fiction, Non-Fiction, Sci-Fi, Biography, or Other to organize your library.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary font-bold text-lg mb-2">
              ⏱️
            </div>
            <CardTitle className="text-lg font-bold text-foreground">
              See minutes read
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              View real-time totals, favorite counts, and detailed genre breakdowns instantly.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
