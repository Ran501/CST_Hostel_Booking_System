import { hostelService } from "../../../../modules/hostel/hostel.service";

// ✅ GET all hostels
export async function GET() {
  try {
    const hostels = await hostelService.getHostels();
    return Response.json(hostels);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// ✅ UPDATE hostel
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, gender, isActive } = body;

    const updated = await hostelService.updateHostel(id, {
      gender,
      isActive,
    });

    return Response.json(updated);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}