import { prisma } from "../../lib/prisma";

export async function GET() {
  try {
    console.log("prisma keys:", Object.keys(prisma));
    console.log("bookingPeriod:", prisma.bookingPeriod);
    const period = await prisma.bookingPeriod.findFirst({
      where: { isActive: true },
      select: {
        startDate: true,
        endDate: true,
        isActive: true,
        year: true,
      },
    });

    if (!period) {
      return Response.json({ success: false, error: "No active booking period found." }, { status: 404 });
    }

    return Response.json({ success: true, period });

  } catch (err) {
    console.error("Booking period error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}