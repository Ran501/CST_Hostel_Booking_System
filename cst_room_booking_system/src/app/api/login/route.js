import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-must-change-in-production"
);

async function createSessionCookie(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
  return token;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, hash) {
  const ok = await bcrypt.compare(password, hash || "");
  return { ok, needsRehash: false };
}

async function loginSuccessResponse(user) {
  const { password, otpHash, otpExpiresAt, ...userWithoutSensitive } = user;
  const token = await createSessionCookie({
    studentNumber: userWithoutSensitive.studentNumber,
    role: userWithoutSensitive.role,
  });
  const res = NextResponse.json({ success: true, user: userWithoutSensitive });
  res.cookies.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentNumber, password } = body;

    if (!studentNumber) {
      return Response.json(
        { success: false, error: "Student number is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { studentNumber: studentNumber.toString() },
      include: { counselor: true },
    });

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const role = (user.role || "").trim().toLowerCase();

    if (role === "admin") {
      if (!password) {
        return Response.json(
          { success: false, error: "Password is required" },
          { status: 400 }
        );
      }
      if (!user.password) {
        return Response.json(
          { success: false, error: "No password set for this admin account" },
          { status: 401 }
        );
      }
      const { ok, needsRehash } = await verifyPassword(password, user.password);
      if (!ok) {
        return Response.json(
          { success: false, error: "Invalid password" },
          { status: 401 }
        );
      }
      if (needsRehash) {
        await prisma.user.update({
          where: { id: user.id },
          data: { password: await hashPassword(password), hasSetPassword: true },
        });
      }
      return loginSuccessResponse(user);
    }

    if (!user.isActive) {
      return Response.json(
        {
          success: false,
          error: "Account not activated. Please activate your account first.",
          requiresActivation: true,
        },
        { status: 403 }
      );
    }

    if (!user.hasSetPassword) {
      return Response.json(
        {
          success: false,
          error: "Please set your password first after activation",
          requiresPasswordSetup: true,
          studentNumber: user.studentNumber,
        },
        { status: 200 }
      );
    }

    if (!password) {
      return Response.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    const { ok, needsRehash } = await verifyPassword(password, user.password);
    if (!ok) {
      return Response.json(
        { success: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    if (needsRehash) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await hashPassword(password), hasSetPassword: true },
      });
    }

    return loginSuccessResponse(user);
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}