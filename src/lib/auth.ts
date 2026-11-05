import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const COOKIE_NAME = "token";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET is not defined in environment variables");
    }
    return new TextEncoder().encode("development-fallback-secret-key-qe190151");
  }
  return new TextEncoder().encode(secret);
}

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  name?: string | null;
  [key: string]: unknown;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: TokenPayload): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    // 1. Try to read from Cookie
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get(COOKIE_NAME)?.value;

    let token = tokenCookie;

    // 2. If no cookie, try to read from Authorization header: Bearer <token>
    if (!token) {
      const headerStore = headers();
      const authHeader = headerStore.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw error;
    }
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

