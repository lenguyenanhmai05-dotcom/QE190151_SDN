import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

