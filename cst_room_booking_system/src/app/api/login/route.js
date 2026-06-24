// src/app/api/login/route.js
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { signJWT } from "../../lib/jwt";
import { hashPassword, verifyPassword } from "../../lib/password";

async function loginSuccessResponse(user) {
  const { password: _, otpHash, otpExpiresAt, ...userWithoutPassword } = user;

  const token = await signJWT({
    studentNumber: user.studentNumber,
    role: user.role,
    name: user.name,
  });

  const response = NextResponse.json({
    success: true,
    user: userWithoutPassword,
  });

  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
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

    // ✅ Include counselor relation
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

    // ✅ Admin check — if role is admin in the database, accept admin login
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
          data: {
            password: await hashPassword(password),
            hasSetPassword: true,
          },
        });
      }

      return loginSuccessResponse(user);
    }

    // Check if account is active
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

    // Check if user has set password
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

    // Verify password
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
        data: {
          password: await hashPassword(password),
          hasSetPassword: true,
        },
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