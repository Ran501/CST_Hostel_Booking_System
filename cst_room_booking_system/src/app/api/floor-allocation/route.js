import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const building = searchParams.get("building");
    const floor = Number(searchParams.get("floor"));

    if (!building || !Number.isInteger(floor)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid building/floor parameters" },
        { status: 400 }
      );
    }

    const allocation = await prisma.floorAllocation.findFirst({
      where: {
        floor,
        hostel: { is: { hostelName: building } },
      },
      select: {
        floor: true,
        studentYear: true,
      },
    });

    return NextResponse.json({
      success: true,
      allocatedYear: allocation?.studentYear ?? null,
      floor: allocation?.floor ?? floor,
    });
  } catch (error) {
    console.error("[GET /api/floor-allocation]", error);
    return NextResponse.json(
      { success: false, error: "Failed to load floor allocation" },
      { status: 500 }
    );
  }
}
