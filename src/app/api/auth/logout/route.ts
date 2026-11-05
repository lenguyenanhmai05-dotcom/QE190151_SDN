import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  const isHtml = request.headers.get("accept")?.includes("text/html");

  const response = isHtml
    ? NextResponse.redirect(new URL("/login", request.url))
    : NextResponse.json({ message: "Logged out successfully" }, { status: 200 });

  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  return response;
}

export async function GET(request: Request) {
  return POST(request);
}
