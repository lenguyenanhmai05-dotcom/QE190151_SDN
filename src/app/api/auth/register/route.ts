import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required", message: "Email and password are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists", message: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        password: hashedPassword,
        name: name ? name.trim() : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user,
        token,
      },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

