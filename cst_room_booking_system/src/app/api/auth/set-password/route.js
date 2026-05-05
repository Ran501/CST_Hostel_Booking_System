import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentNumber, password } = body;

    if (!studentNumber || !password) {
      return Response.json(
        { success: false, error: "Student number and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return Response.json(
        { success: false, error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Find user by student number
    const user = await prisma.user.findUnique({
      where: { studentNumber: studentNumber.toString() },
    });

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return Response.json(
        { success: false, error: "Account not activated" },
        { status: 403 }
      );
    }

    // Check if user already has a password set
    if (user.hasSetPassword) {
      return Response.json(
        { success: false, error: "Password already set. Please login with your existing password." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password and mark as having set password
    await prisma.user.update({
      where: { studentNumber: studentNumber.toString() },
      data: {
        password: hashedPassword,
        hasSetPassword: true,
      },
    });

    return Response.json({
      success: true,
      message: "Password set successfully",
    });
  } catch (error) {
    console.error("Set password error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
