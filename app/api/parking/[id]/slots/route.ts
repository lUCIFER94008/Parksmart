import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase, isDatabaseConfigured } from "@/lib/db/mongodb";
import { ParkingSlot } from "@/models/ParkingSlot";
import { ParkingLocation } from "@/models/ParkingLocation";
import { Booking } from "@/models/Booking";
import { generateFacilitySlots, SAMPLE_LOCATIONS } from "@/lib/data/sample-parking";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startStr = searchParams.get("startTime");
    const endStr = searchParams.get("endTime");

    const startTime = startStr ? new Date(startStr) : null;
    const endTime = endStr ? new Date(endStr) : null;

    if (isDatabaseConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        // Resolve location
        let locDoc: any = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
          locDoc = await ParkingLocation.findById(id);
        }
        if (!locDoc) {
          const cleanSlug = id.replace(/^loc-/, "");
          locDoc = await ParkingLocation.findOne({
            $or: [{ slug: id }, { slug: cleanSlug }],
          });
        }
        if (!locDoc) {
          const sample = SAMPLE_LOCATIONS.find((s) => s.id === id || s.slug === id);
          if (sample) {
            locDoc = await ParkingLocation.findOne({
              $or: [{ slug: sample.slug }, { name: sample.name }],
            });
          }
        }

        const queryLocId = locDoc ? locDoc._id : id;
        const slots = await ParkingSlot.find({ locationId: queryLocId }).lean();
        
        if (slots && slots.length > 0) {
          // If interval is provided, check booking conflicts
          if (startTime && endTime && !isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
            const conflictingBookings = await Booking.find({
              $or: [{ locationId: queryLocId }, { locationId: id }],
              status: { $in: ["confirmed", "checked_in"] },
              startTime: { $lt: endTime },
              endTime: { $gt: startTime },
            }).lean();

            const conflictingSlotIds = new Set(
              conflictingBookings.map((b) => b.slotId?.toString()).filter(Boolean)
            );
            const conflictingSlotNumbers = new Set(
              conflictingBookings.map((b) => b.slotNumber).filter(Boolean)
            );

            const computedSlots = slots.map((s) => {
              const isConflicted =
                conflictingSlotIds.has(s._id.toString()) ||
                conflictingSlotNumbers.has(s.slotNumber);

              return {
                id: s._id.toString(),
                slotNumber: s.slotNumber,
                floor: s.floor,
                vehicleType: s.vehicleType,
                status: s.status === "maintenance"
                  ? "maintenance"
                  : isConflicted
                  ? "occupied"
                  : s.status,
                pricePerHour: s.hourlyRateOverride || locDoc?.hourlyRate || 6.0,
              };
            });

            return NextResponse.json({
              success: true,
              source: "database_live_interval",
              count: computedSlots.length,
              data: computedSlots,
            });
          }

          const formatted = slots.map((s) => ({
            id: s._id.toString(),
            slotNumber: s.slotNumber,
            floor: s.floor,
            vehicleType: s.vehicleType,
            status: s.status,
            pricePerHour: s.hourlyRateOverride || locDoc?.hourlyRate || 6.0,
          }));

          return NextResponse.json({ success: true, count: formatted.length, data: formatted });
        }
      }
    }

    // Fallback to sample generated slots
    const sampleSlots = generateFacilitySlots(id, 24);
    return NextResponse.json({
      success: true,
      source: "sample_dataset",
      count: sampleSlots.length,
      data: sampleSlots,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve parking slots" },
      { status: 500 }
    );
  }
}
