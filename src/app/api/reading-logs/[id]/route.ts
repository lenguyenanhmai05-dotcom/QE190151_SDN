import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatReadingLog, isFutureDate } from "@/lib/readingLogUtils";

export const dynamic = "force-dynamic";

const VALID_GENRES = ["Fiction", "Non-Fiction", "Sci-Fi", "Biography", "Other"];

// PATCH /api/reading-logs/:id
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check ownership
    const existingLog = await prisma.readingLog.findUnique({
      where: { id },
    });

    if (!existingLog || existingLog.userId !== user.id) {
      return NextResponse.json({ error: "Reading log not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updateData: {
      bookTitle?: string;
      minutesRead?: number;
      genre?: string;
      note?: string;
      readOn?: string;
      favorite?: boolean;
    } = {};

    // Validate fields if provided
    if ("bookTitle" in body) {
      const { bookTitle } = body;
      if (bookTitle === undefined || bookTitle === null || typeof bookTitle !== "string" || !bookTitle.trim()) {
        return NextResponse.json({ error: "Book title is required" }, { status: 400 });
      }
      if (bookTitle.trim().length > 80) {
        return NextResponse.json({ error: "Book title must be at most 80 characters" }, { status: 400 });
      }
      updateData.bookTitle = bookTitle.trim();
    }

    if ("minutesRead" in body) {
      const { minutesRead } = body;
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
      updateData.minutesRead = parsedMinutes;
    }

    if ("genre" in body) {
      const { genre } = body;
      if (!genre || typeof genre !== "string" || genre.trim() === "" || genre === "Choose genre") {
        return NextResponse.json({ error: "Please choose a genre" }, { status: 400 });
      }
      if (!VALID_GENRES.includes(genre.trim())) {
        return NextResponse.json({ error: "Invalid genre" }, { status: 400 });
      }
      updateData.genre = genre.trim();
    }

    if ("readOn" in body) {
      const { readOn } = body;
      if (!readOn || typeof readOn !== "string" || !readOn.trim()) {
        return NextResponse.json({ error: "Date is required" }, { status: 400 });
      }
      const trimmedDate = readOn.trim();
      if (isFutureDate(trimmedDate)) {
        return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 });
      }
      updateData.readOn = trimmedDate;
    }

    if ("note" in body) {
      updateData.note = body.note ? String(body.note).trim() : "";
    }

    if ("favorite" in body) {
      updateData.favorite = Boolean(body.favorite);
    }

    // Check duplicate if title, minutesRead, or readOn changed
    const targetTitle = updateData.bookTitle ?? existingLog.bookTitle;
    const targetMinutes = updateData.minutesRead ?? existingLog.minutesRead;
    const targetReadOn = updateData.readOn ?? existingLog.readOn;

    if (
      updateData.bookTitle !== undefined ||
      updateData.minutesRead !== undefined ||
      updateData.readOn !== undefined
    ) {
      const duplicate = await prisma.readingLog.findFirst({
        where: {
          userId: user.id,
          id: { not: id },
          bookTitle: { equals: targetTitle, mode: "insensitive" },
          minutesRead: targetMinutes,
          readOn: targetReadOn,
        },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            error:
              "Duplicate reading session: a reading session with the same book title, minutes and date already exists",
          },
          { status: 409 }
        );
      }
    }

    const updatedLog = await prisma.readingLog.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(formatReadingLog(updatedLog), { status: 200 });
  } catch (error) {
    console.error("PATCH reading-log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/reading-logs/:id
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const existingLog = await prisma.readingLog.findUnique({
      where: { id },
    });

    if (!existingLog || existingLog.userId !== user.id) {
      return NextResponse.json({ error: "Reading log not found" }, { status: 404 });
    }

    await prisma.readingLog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE reading-log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

