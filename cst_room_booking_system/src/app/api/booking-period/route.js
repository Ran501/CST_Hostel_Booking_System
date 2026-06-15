import { prisma } from "../../lib/prisma";

export async function GET() {
  try {
    const period = await prisma.bookingPeriod.findFirst({

        select: {
          isActive: true,
        }
    });

    if (!period || !period.isActive) {
      return Response.json({ 
        success: false, 
        error: "Unbooking is not allowed at this time." 
      }, { status: 403 });
    }

    return Response.json({ success: true, period });

  } catch (err) {
    console.error("Booking period error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}