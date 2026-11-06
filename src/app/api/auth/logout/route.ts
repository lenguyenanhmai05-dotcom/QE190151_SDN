import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  );

  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}

export async function GET() {
  return POST();
}
