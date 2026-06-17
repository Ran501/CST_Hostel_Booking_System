import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";

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

    // Static admin bypass
    if (studentNumber.toString().trim() === "02230125") {
      if (!password || password.trim() !== "lepcha") {
        return Response.json(
          { success: false, error: "Invalid password" },
          { status: 401 }
        );
      }
      return Response.json({
        success: true,
        user: {
          studentNumber: "02230125",
          name: "Admin",
          email: "admin@cst.edu.bt",
          role: "admin",
          gender: "male",
          phoneNumber: "",
          // No counselor relation for admin
          counselor: null,
        },
      });
    }

    // Find user with counselor relation
    const user = await prisma.user.findUnique({
      where: { studentNumber: studentNumber.toString() },
      include: {
        counselor: {
          include: {
            hostel: true,   // includes hostel details for the counselor
          },
        },
      },
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

    const passwordMatch = await bcrypt.compare(password, user.password || "");
    if (!passwordMatch) {
      return Response.json(
        { success: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    // Remove password field before returning
    const { password: _, ...userWithoutPassword } = user;

    return Response.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}