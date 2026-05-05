import { prisma } from "../../../lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentNumber } = body;

    if (!studentNumber) {
      return Response.json(
        { success: false, error: "Student number is required" },
        { status: 400 }
      );
    }

    // Static admin bypass
    if (studentNumber.toString().trim() === "02230125") {
      return Response.json({
        success: true,
        user: {
          studentNumber: "02230125",
          name: "Admin",
          email: "admin@cst.edu.bt",
          role: "admin",
          gender: "male",
          phoneNumber: "",
        },
      });
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
        { 
          success: false, 
          error: "Account not activated",
          requiresActivation: true
        },
        { status: 403 }
      );
    }

    // Return user data (excluding password)
    const { password, otpHash, otpExpiresAt, ...userWithoutSensitive } = user;

    return Response.json({
      success: true,
      user: userWithoutSensitive,
    });
  } catch (error) {
    console.error("Session verify error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
