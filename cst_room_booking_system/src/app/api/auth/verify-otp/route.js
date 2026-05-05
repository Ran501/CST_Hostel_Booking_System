import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentNumber, otp } = body;

    if (!studentNumber || !otp) {
      return Response.json(
        { success: false, error: "Student number and OTP are required" },
        { status: 400 }
      );
    }

    // Find user by student number
    const user = await prisma.user.findUnique({
      where: { studentNumber: studentNumber.toString() },
    });

    if (!user) {
      return Response.json(
        { success: false, error: "Student number not found" },
        { status: 404 }
      );
    }

    // Check if account is already active
    if (user.isActive) {
      return Response.json(
        { success: false, error: "Account is already activated" },
        { status: 400 }
      );
    }

    // Check if OTP exists
    if (!user.otpHash || !user.otpExpiresAt) {
      return Response.json(
        { success: false, error: "No OTP requested. Please request an OTP first." },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiresAt) {
      // Clear expired OTP
      await prisma.user.update({
        where: { studentNumber: studentNumber.toString() },
        data: {
          otpHash: null,
          otpExpiresAt: null,
        },
      });

      return Response.json(
        { success: false, error: "OTP has expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValidOTP = await bcrypt.compare(otp, user.otpHash);

    if (!isValidOTP) {
      return Response.json(
        { success: false, error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Activate account and clear OTP
    await prisma.user.update({
      where: { studentNumber: studentNumber.toString() },
      data: {
        isActive: true,
        otpHash: null,
        otpExpiresAt: null,
      },
    });

    return Response.json({
      success: true,
      message: "Account activated successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
