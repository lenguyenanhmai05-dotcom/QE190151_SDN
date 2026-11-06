import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatReadingLog, isFutureDate } from "@/lib/readingLogUtils";

export const dynamic = "force-dynamic";

const VALID_GENRES = ["Fiction", "Non-Fiction", "Sci-Fi", "Biography", "Other"];

// GET /api/reading-logs
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

    // Fetch all logs for this user
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

    // Sorting:
    // Ordered by readOn descending (most recent first);
    // ties broken by bookTitle, alphabetically, case-insensitive.
    logs.sort((a, b) => {
      const dateCompare = b.readOn.localeCompare(a.readOn);
      if (dateCompare !== 0) return dateCompare;
      return a.bookTitle.toLowerCase().localeCompare(b.bookTitle.toLowerCase());
    });

    return NextResponse.json(logs.map(formatReadingLog), { status: 200 });
  } catch (error) {
    console.error("GET reading-logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/reading-logs
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { bookTitle, minutesRead, genre, note, readOn } = body;

    // 1. Validate Book title
    if (bookTitle === undefined || bookTitle === null || typeof bookTitle !== "string" || !bookTitle.trim()) {
      return NextResponse.json({ error: "Book title is required" }, { status: 400 });
    }
    if (bookTitle.trim().length > 80) {
      return NextResponse.json({ error: "Book title must be at most 80 characters" }, { status: 400 });
    }

    // 2. Validate Minutes read
    if (
      minutesRead === undefined ||
      minutesRead === null ||
      minutesRead === "" ||
      isNaN(Number(minutesRead))
    ) {
      return NextResponse.json({ error: "Minutes read is required" }, { status: 400 });
    }
    const parsedMinutes = Number(minutesRead);
    if (!Number.isInteger(parsedMinutes) || parsedMinutes <= 0) {
      return NextResponse.json({ error: "Minutes read must be a positive number" }, { status: 400 });
    }

    // 3. Validate Genre
    if (!genre || typeof genre !== "string" || genre.trim() === "" || genre === "Choose genre") {
      return NextResponse.json({ error: "Please choose a genre" }, { status: 400 });
    }
    if (!VALID_GENRES.includes(genre.trim())) {
      return NextResponse.json({ error: "Invalid genre" }, { status: 400 });
    }

    // 4. Validate Date
    if (!readOn || typeof readOn !== "string" || !readOn.trim()) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }
    const trimmedDate = readOn.trim();
    if (isFutureDate(trimmedDate)) {
      return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 });
    }

    // 5. Duplicate check (same bookTitle, minutesRead and readOn already saved by this user)
    const existingLog = await prisma.readingLog.findFirst({
      where: {
        userId: user.id,
        bookTitle: { equals: bookTitle.trim(), mode: "insensitive" },
        minutesRead: parsedMinutes,
        readOn: trimmedDate,
      },
    });

    if (existingLog) {
      return NextResponse.json(
        {
          error:
            "Duplicate reading session: a reading session with the same book title, minutes and date already exists",
        },
        { status: 409 }
      );
    }

    // Create session (ignoring any userId/ownerId from client body)
    const newLog = await prisma.readingLog.create({
      data: {
        userId: user.id,
        bookTitle: bookTitle.trim(),
        minutesRead: parsedMinutes,
        genre: genre.trim(),
        note: note ? String(note).trim() : "",
        readOn: trimmedDate,
        favorite: false,
      },
    });

    return NextResponse.json(formatReadingLog(newLog), { status: 201 });
  } catch (error) {
    console.error("POST reading-logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

