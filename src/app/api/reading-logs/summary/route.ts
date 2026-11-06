import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const GENRE_PRIORITY: Record<string, number> = {
  Fiction: 1,
  "Non-Fiction": 2,
  "Sci-Fi": 3,
  Biography: 4,
  Other: 5,
};

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const genreParam = searchParams.get("genre");
    const favoriteParam = searchParams.get("favorite");
    const qParam = searchParams.get("q");

    let logs = await prisma.readingLog.findMany({
      where: { userId: user.id },
    });

    // Filtering
    if (genreParam && genreParam.trim() !== "") {
      logs = logs.filter((log) => log.genre === genreParam.trim());
    }

    if (favoriteParam !== null && favoriteParam !== undefined && favoriteParam !== "") {
      if (favoriteParam === "true") {
        logs = logs.filter((log) => log.favorite === true);
      } else if (favoriteParam === "false") {
        logs = logs.filter((log) => log.favorite === false);
      }
    }

    if (qParam !== null && qParam !== undefined && qParam.trim() !== "") {
      const q = qParam.trim().toLowerCase();
      logs = logs.filter((log) => {
        const titleMatch = log.bookTitle.toLowerCase().includes(q);
        const noteMatch = (log.note || "").toLowerCase().includes(q);
        return titleMatch || noteMatch;
      });
    }

    const count = logs.length;
    const favoriteCount = logs.filter((l) => l.favorite).length;
    const totalMinutes = logs.reduce((sum, l) => sum + l.minutesRead, 0);

    // Compute breakdown per genre present
    const genreMap: Record<string, { count: number; total: number }> = {};
    for (const log of logs) {
      if (!genreMap[log.genre]) {
        genreMap[log.genre] = { count: 0, total: 0 };
      }
      genreMap[log.genre].count += 1;
      genreMap[log.genre].total += log.minutesRead;
    }

    const breakdown = Object.keys(genreMap).map((genre) => ({
      genre,
      count: genreMap[genre].count,
      total: genreMap[genre].total,
    }));

    // Ordering breakdown:
    // ordered by total minutes descending;
    // equal totals are ordered Fiction, then Non-Fiction, then Sci-Fi, then Biography, then Other.
    breakdown.sort((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      const priorityA = GENRE_PRIORITY[a.genre] ?? 99;
      const priorityB = GENRE_PRIORITY[b.genre] ?? 99;
      return priorityA - priorityB;
    });

    return NextResponse.json(
      {
        count,
        favoriteCount,
        totalMinutes,
        breakdown,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET reading-logs summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

