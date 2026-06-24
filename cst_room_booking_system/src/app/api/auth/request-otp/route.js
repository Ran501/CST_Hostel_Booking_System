import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// Rate limiting store (in-memory for simplicity, use Redis in production)
const rateLimiter = new Map();

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

    // Rate limiting: max 3 requests per 10 minutes per student number
    const now = Date.now();
    const studentRateLimit = rateLimiter.get(studentNumber) || { count: 0, resetTime: now + 600000 };
    
    if (now > studentRateLimit.resetTime) {
      studentRateLimit.count = 0;
      studentRateLimit.resetTime = now + 600000;
    }

    if (studentRateLimit.count >= 3) {
      return Response.json(
        { success: false, error: "Too many OTP requests. Please try again later." },
        { status: 429 }
      );
    }

    studentRateLimit.count++;
    rateLimiter.set(studentNumber, studentRateLimit);

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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the OTP
    const otpHash = await bcrypt.hash(otp, 10);
    
    // Set expiry time (10 minutes from now)
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with OTP hash and expiry
    await prisma.user.update({
      where: { studentNumber: studentNumber.toString() },
      data: {
        otpHash,
        otpExpiresAt,
      },
    });

    // Send OTP to email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER_OTP,
        pass: process.env.EMAIL_PASS_OTP,
      },
    });

    const mailOptions = {
      from: `"Hostel Management" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Account Activation OTP",
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 500px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2563eb; margin-top: 0;">Account Activation</h2>
          <p>Hello ${user.name},</p>
          <p>Your OTP for account activation is:</p>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px;">${otp}</span>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #777;">This is an automated email from the Hostel Booking System.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return Response.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Request OTP error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
