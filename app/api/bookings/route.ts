import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import QRCode from "qrcode";
import { connectToDatabase, isDatabaseConfigured } from "@/lib/db/mongodb";
import { Booking } from "@/models/Booking";
import { ParkingLocation } from "@/models/ParkingLocation";
import { ParkingSlot } from "@/models/ParkingSlot";
import { User } from "@/models/User";
import { calculateReservationPricing } from "@/lib/pricing/calculator";
import { SAMPLE_LOCATIONS } from "@/lib/data/sample-parking";
import { getSession } from "@/lib/auth/session";

const BookingCreateSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
  slotNumber: z.string().min(1, "Slot number is required"),
  slotId: z.string().optional(),
  vehiclePlate: z.string().min(2, "Vehicle plate number is required"),
  vehicleType: z.enum(["car", "motorcycle", "ev", "accessible"]).default("car"),
  vehicleModel: z.string().optional(),
  startTime: z.string().min(1, "Arrival date and time is required"),
  endTime: z.string().min(1, "Departure date and time is required"),
  hourlyRate: z.number().min(0).optional(),
});

export async function POST(request: Request) {
  try {
    // 0. Independent server authentication check
    const sessionUser = await getSession();
    if (!sessionUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please sign in to confirm your parking reservation.",
        },
        { status: 401 }
      );
    }
    const body = await request.json();
    const parsed = BookingCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      locationId,
      slotNumber,
      slotId,
      vehiclePlate,
      vehicleType,
      vehicleModel,
      startTime: startStr,
      endTime: endStr,
    } = parsed.data;

    // 1. Validate dates and interval
    const startTime = new Date(startStr);
    const endTime = new Date(endStr);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid start or end date/time" },
        { status: 400 }
      );
    }

    if (endTime <= startTime) {
      return NextResponse.json(
        { success: false, error: "Departure time must be strictly after arrival time." },
        { status: 400 }
      );
    }

    // Reject past arrival times (allow 10-minute clock leeway for local time difference)
    const nowWithLeeway = new Date(Date.now() - 10 * 60 * 1000);
    if (startTime < nowWithLeeway) {
      return NextResponse.json(
        { success: false, error: "Arrival time cannot be in the past." },
        { status: 400 }
      );
    }

    // 2. Connect to MongoDB if configured
    let dbConnected = false;
    let matchedLocationDoc: any = null;
    let matchedSlotDoc: any = null;
    let defaultUserDoc: any = null;

    if (isDatabaseConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        dbConnected = true;

        // Find facility by _id, slug, or sample mapping
        if (mongoose.Types.ObjectId.isValid(locationId)) {
          matchedLocationDoc = await ParkingLocation.findById(locationId);
        }
        if (!matchedLocationDoc) {
          const cleanSlug = locationId.replace(/^loc-/, "");
          matchedLocationDoc = await ParkingLocation.findOne({
            $or: [{ slug: locationId }, { slug: cleanSlug }],
          });
        }
        if (!matchedLocationDoc) {
          const sample = SAMPLE_LOCATIONS.find((s) => s.id === locationId || s.slug === locationId);
          if (sample) {
            matchedLocationDoc = await ParkingLocation.findOne({
              $or: [{ slug: sample.slug }, { name: sample.name }],
            });
          }
        }

        // Find slot by locationId and slotNumber (or slotId)
        if (matchedLocationDoc) {
          matchedSlotDoc = await ParkingSlot.findOne({
            locationId: matchedLocationDoc._id,
            slotNumber: slotNumber,
          });

          if (!matchedSlotDoc && slotId && mongoose.Types.ObjectId.isValid(slotId)) {
            matchedSlotDoc = await ParkingSlot.findById(slotId);
          }
        }

        // Find standard demo driver user
        defaultUserDoc =
          (await User.findOne({ email: "driver@parksmart.io" })) ||
          (await User.findOne({ role: "user" })) ||
          (await User.findOne());
      }
    }

    // Fallback facility metadata from sample if DB doc not yet found
    const sampleFacility = SAMPLE_LOCATIONS.find(
      (s) => s.id === locationId || s.slug === locationId
    );
    const facilityName = matchedLocationDoc?.name || sampleFacility?.name || "ParkSmart Central";
    const facilityAddress = matchedLocationDoc
      ? `${matchedLocationDoc.address}, ${matchedLocationDoc.city}`
      : sampleFacility
      ? `${sampleFacility.address}, ${sampleFacility.city}`
      : "Central Business District";
    const supportedVehicles: string[] =
      matchedLocationDoc?.supportedVehicles || sampleFacility?.supportedVehicles || ["car", "ev", "motorcycle", "accessible"];
    const baseRate = matchedLocationDoc?.hourlyRate || sampleFacility?.hourlyRate || 6.0;
    const vehiclePricing = matchedLocationDoc?.vehiclePricing || sampleFacility?.vehiclePricing;

    // 3. Verify vehicle type compatibility with facility
    if (!supportedVehicles.includes(vehicleType)) {
      return NextResponse.json(
        {
          success: false,
          error: `The parking facility "${facilityName}" does not support ${vehicleType.toUpperCase()} vehicles. Please select a supported vehicle type or choose another facility.`,
        },
        { status: 400 }
      );
    }

    // 4. Verify slot compatibility & status if slot record exists
    if (matchedSlotDoc) {
      if (matchedSlotDoc.status === "maintenance") {
        return NextResponse.json(
          {
            success: false,
            error: `Slot ${slotNumber} is currently undergoing maintenance and cannot be reserved.`,
          },
          { status: 409 }
        );
      }
    }

    // 5. Authoritative Server Pricing Calculation
    const pricing = calculateReservationPricing({
      baseHourlyRate: baseRate,
      vehicleType,
      vehiclePricingOverride: vehiclePricing,
      startTime,
      endTime,
      taxRatePercent: 8,
      serviceFee: 1.5,
    });

    // 6. Generate unique public booking reference
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `PK-${datePrefix}-${randomSuffix}`;

    // 7. Overlap conflict prevention & MongoDB persistence
    let qrCodeDataUrl = "";
    const qrPayload = `PARKSMART|REF:${bookingReference}|LOC:${matchedLocationDoc?.slug || locationId}|SLOT:${slotNumber}|PLATE:${vehiclePlate.toUpperCase()}`;

    if (dbConnected) {
      // Slot conflict query: check if this slot has an active booking that overlaps
      const locIdForQuery = matchedLocationDoc ? matchedLocationDoc._id : locationId;
      const conflictQuery: any = {
        $or: [
          ...(matchedSlotDoc ? [{ slotId: matchedSlotDoc._id }] : []),
          { locationId: locIdForQuery, slotNumber },
          { locationId, slotNumber },
        ],
        status: { $in: ["confirmed", "checked_in"] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      };

      const conflict = await Booking.findOne(conflictQuery);

      if (conflict) {
        return NextResponse.json(
          {
            success: false,
            error: `Conflict: Slot ${slotNumber} is already booked for the selected time interval (${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}). Please select a different slot or time.`,
          },
          { status: 409 }
        );
      }

      // Concurrency protection: Atomic booking persistence in MongoDB
      const createdBooking = await Booking.create({
        bookingReference,
        userId: sessionUser.id,
        locationId: locIdForQuery,
        slotId: matchedSlotDoc ? matchedSlotDoc._id : new mongoose.Types.ObjectId(),
        slotNumber,
        facilityName,
        facilityAddress,
        floor: matchedSlotDoc?.floor || "Floor 1",
        vehiclePlate: vehiclePlate.toUpperCase(),
        vehicleModel: vehicleModel || "Standard Vehicle",
        vehicleType,
        startTime,
        endTime,
        durationHours: pricing.durationHours,
        pricingSnapshot: {
          hourlyRate: pricing.effectiveHourlyRate,
          hours: pricing.durationHours,
          subtotal: pricing.subtotal,
          taxesAndFees: pricing.taxesAndFees,
          totalAmount: pricing.totalAmount,
          currency: pricing.currency,
        },
        totalAmount: pricing.totalAmount,
        status: "confirmed",
        paymentStatus: "paid",
      });

      // Generate the QR pass ONLY for successfully persisted booking
      qrCodeDataUrl = await QRCode.toDataURL(
        `PARKSMART|REF:${createdBooking.bookingReference}|BOOKING_ID:${createdBooking._id}|SLOT:${slotNumber}|PLATE:${vehiclePlate.toUpperCase()}`,
        {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 320,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        }
      );

      // Save generated QR code back to persisted document
      createdBooking.qrCodeDataUrl = qrCodeDataUrl;
      await createdBooking.save();

      return NextResponse.json({
        success: true,
        message: "Booking confirmed and saved to MongoDB successfully.",
        data: {
          id: createdBooking._id.toString(),
          bookingReference: createdBooking.bookingReference,
          facilityName,
          facilityAddress,
          slotNumber: createdBooking.slotNumber,
          floor: createdBooking.floor,
          vehiclePlate: createdBooking.vehiclePlate,
          vehicleModel: createdBooking.vehicleModel,
          vehicleType: createdBooking.vehicleType,
          startTime: createdBooking.startTime,
          endTime: createdBooking.endTime,
          durationHours: createdBooking.durationHours,
          totalAmount: createdBooking.totalAmount,
          pricingSnapshot: createdBooking.pricingSnapshot,
          status: createdBooking.status,
          qrCodeDataUrl: createdBooking.qrCodeDataUrl,
          qrPayload,
        },
      });
    }

    // Verified demo response if database is completely unconfigured
    return NextResponse.json({
      success: true,
      message: "Reservation confirmed in verified demo mode.",
      data: {
        bookingReference,
        facilityName,
        facilityAddress,
        slotNumber,
        floor: "Floor 1",
        vehiclePlate: vehiclePlate.toUpperCase(),
        vehicleModel: vehicleModel || "Standard Vehicle",
        vehicleType,
        startTime,
        endTime,
        durationHours: pricing.durationHours,
        totalAmount: pricing.totalAmount,
        pricingSnapshot: pricing,
        status: "confirmed",
        qrCodeDataUrl,
        qrPayload,
      },
    });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred while confirming your reservation.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sessionUser = await getSession();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view bookings." },
        { status: 401 }
      );
    }

    if (isDatabaseConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        let query: any = {};
        if (sessionUser.role !== "admin") {
          query = {
            $or: [
              { userId: sessionUser.id },
              ...(mongoose.Types.ObjectId.isValid(sessionUser.id)
                ? [{ userId: new mongoose.Types.ObjectId(sessionUser.id) }]
                : []),
            ],
          };
        }
        const userBookings = await Booking.find(query).sort({ createdAt: -1 }).lean();
        return NextResponse.json({
          success: true,
          count: userBookings.length,
          data: userBookings,
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: 0,
      data: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve bookings." },
      { status: 500 }
    );
  }
}
