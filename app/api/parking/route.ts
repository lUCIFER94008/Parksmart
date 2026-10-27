import { NextResponse } from "next/server";
import { connectToDatabase, isDatabaseConfigured } from "@/lib/db/mongodb";
import { ParkingLocation } from "@/models/ParkingLocation";
import { SAMPLE_LOCATIONS } from "@/lib/data/sample-parking";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase();

    // If database is configured and reachable
    if (isDatabaseConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const filter: any = { isActive: true };
        if (query) {
          filter.$or = [
            { name: { $regex: query, $options: "i" } },
            { address: { $regex: query, $options: "i" } },
            { city: { $regex: query, $options: "i" } },
          ];
        }
        const dbLocations = await ParkingLocation.find(filter).lean();
        if (dbLocations && dbLocations.length > 0) {
          return NextResponse.json({
            success: true,
            source: "database",
            count: dbLocations.length,
            data: dbLocations,
          });
        }
      }
    }

    // Graceful fallback to verified sample locations with demo metadata
    let results = SAMPLE_LOCATIONS;
    if (query) {
      results = results.filter(
        (loc) =>
          loc.name.toLowerCase().includes(query) ||
          loc.address.toLowerCase().includes(query) ||
          loc.city.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      source: "verified_demo_dataset",
      message: "Showing verified sample facilities. Configure MONGODB_URI in .env.local to persist live records.",
      count: results.length,
      data: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve parking locations" },
      { status: 500 }
    );
  }
}
