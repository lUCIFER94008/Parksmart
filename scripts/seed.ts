import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { ParkingLocation } from "../models/ParkingLocation";
import { ParkingSlot } from "../models/ParkingSlot";
import { Vehicle } from "../models/Vehicle";
import { Booking } from "../models/Booking";
import { ParkingSession } from "../models/ParkingSession";
import { Notification } from "../models/Notification";
import { AuditLog } from "../models/AuditLog";
import { SAMPLE_LOCATIONS } from "../lib/data/sample-parking";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/parksmart";

export async function runSeed() {
  console.log("🌱 Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB successfully.");

  console.log("🧹 Clearing existing test data safely...");
  await Promise.all([
    User.deleteMany({}),
    ParkingLocation.deleteMany({}),
    ParkingSlot.deleteMany({}),
    Vehicle.deleteMany({}),
    Booking.deleteMany({}),
    ParkingSession.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log("🔐 Creating Users and Hashing Passwords...");
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // 1. Admin
  const admin = await User.create({
    name: "System Administrator",
    email: "admin@parksmart.io",
    password: hashedPassword,
    phone: "+1 555-0100",
    role: "admin",
    status: "active",
  });

  // 2. Operators
  const operator1 = await User.create({
    name: "Gate 1 Operator - Marcus",
    email: "operator@parksmart.io",
    password: hashedPassword,
    phone: "+1 555-0101",
    role: "operator",
    status: "active",
  });

  const operator2 = await User.create({
    name: "Airport Deck Operator - Elena",
    email: "operator2@parksmart.io",
    password: hashedPassword,
    phone: "+1 555-0102",
    role: "operator",
    status: "active",
  });

  // 3. Regular Drivers
  const driver1 = await User.create({
    name: "Alex Morgan",
    email: "driver@parksmart.io",
    password: hashedPassword,
    phone: "+1 555-0199",
    role: "user",
    status: "active",
  });

  const driver2 = await User.create({
    name: "Sarah Chen",
    email: "sarah@example.com",
    password: hashedPassword,
    phone: "+1 555-0198",
    role: "user",
    status: "active",
  });

  console.log("📍 Creating 5 Parking Facilities & Generating Slots...");
  const locationDocs = [];
  const allSlots = [];

  for (const sample of SAMPLE_LOCATIONS) {
    const loc = await ParkingLocation.create({
      name: sample.name,
      slug: sample.slug,
      tagline: sample.tagline,
      address: sample.address,
      city: sample.city,
      state: sample.state,
      postalCode: sample.postalCode,
      location: {
        type: "Point",
        coordinates: [sample.lng, sample.lat],
      },
      images: sample.galleryImages,
      hourlyRate: sample.hourlyRate,
      dailyRate: sample.dailyRate,
      vehiclePricing: sample.vehiclePricing,
      totalSlots: sample.totalSlots,
      availableSlots: sample.availableSlots,
      occupiedSlots: sample.occupiedSlots,
      reservedSlots: sample.reservedSlots,
      rating: sample.rating,
      reviewCount: sample.reviewCount,
      openingHours: sample.openingHours,
      amenities: sample.amenities,
      supportedVehicles: sample.supportedVehicles,
      featured: sample.featured,
      isActive: true,
    });
    locationDocs.push(loc);

    // Create 16 slots per facility across Floor 1 & Floor 2
    for (let i = 1; i <= 16; i++) {
      const floor = i <= 8 ? "Floor 1" : "Floor 2";
      const vehicleType =
        i % 4 === 1 ? "car" : i % 4 === 2 ? "ev" : i % 4 === 3 ? "accessible" : "motorcycle";
      const status = i === 3 ? "occupied" : i === 7 ? "reserved" : i === 12 ? "maintenance" : "available";

      const slot = await ParkingSlot.create({
        locationId: loc._id,
        slotNumber: `${floor === "Floor 1" ? "A" : "B"}-${String(i).padStart(2, "0")}`,
        floor,
        vehicleType,
        status,
        hourlyRateOverride: vehicleType === "ev" ? loc.hourlyRate + 1.5 : undefined,
      });
      allSlots.push(slot);
    }
  }

  console.log("🚗 Registering Driver Vehicles...");
  const vehicle1 = await Vehicle.create({
    userId: driver1._id,
    plateNumber: "CA-7XYZ99",
    make: "Tesla",
    model: "Model 3 Long Range",
    color: "Pearl White",
    vehicleType: "ev",
    isDefault: true,
  });

  const vehicle2 = await Vehicle.create({
    userId: driver1._id,
    plateNumber: "NY-4BBD81",
    make: "Honda",
    model: "CR-V Hybrid",
    color: "Modern Steel",
    vehicleType: "car",
    isDefault: false,
  });

  const vehicle3 = await Vehicle.create({
    userId: driver2._id,
    plateNumber: "CA-8NMK21",
    make: "BMW",
    model: "i4 eDrive40",
    color: "Mineral White",
    vehicleType: "ev",
    isDefault: true,
  });

  console.log("📅 Creating Sample Bookings & Sessions...");
  const primaryLoc = locationDocs[0];
  const primarySlot = allSlots[0];

  const now = new Date();
  const todayStart = new Date(now.getTime() - 1000 * 60 * 60); // 1 hr ago
  const todayEnd = new Date(now.getTime() + 1000 * 60 * 60 * 2); // 2 hrs ahead

  // Active checked-in booking
  const activeBooking = await Booking.create({
    bookingReference: "PK-20261024-4821",
    userId: driver1._id,
    locationId: primaryLoc._id,
    slotId: primarySlot._id,
    vehiclePlate: vehicle1.plateNumber,
    vehicleModel: `${vehicle1.make} ${vehicle1.model}`,
    vehicleType: "ev",
    startTime: todayStart,
    endTime: todayEnd,
    durationHours: 3,
    pricingSnapshot: {
      hourlyRate: 6.5,
      hours: 3,
      subtotal: 19.5,
      taxesAndFees: 3.06,
      totalAmount: 22.56,
      currency: "USD",
    },
    totalAmount: 22.56,
    status: "checked_in",
    checkInTime: todayStart,
    qrCodeDataUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PK-20261024-4821",
    paymentStatus: "paid",
  });

  // Active parking session
  await ParkingSession.create({
    bookingId: activeBooking._id,
    locationId: primaryLoc._id,
    slotId: primarySlot._id,
    vehiclePlate: vehicle1.plateNumber,
    operatorCheckInId: operator1._id,
    checkInTime: todayStart,
    status: "active",
  });

  // Upcoming reservation
  await Booking.create({
    bookingReference: "PK-20261025-1093",
    userId: driver1._id,
    locationId: locationDocs[2]._id,
    slotId: allSlots[34]._id,
    vehiclePlate: vehicle1.plateNumber,
    vehicleModel: `${vehicle1.make} ${vehicle1.model}`,
    vehicleType: "ev",
    startTime: new Date(now.getTime() + 1000 * 60 * 60 * 24),
    endTime: new Date(now.getTime() + 1000 * 60 * 60 * 48),
    durationHours: 24,
    pricingSnapshot: {
      hourlyRate: 8,
      hours: 24,
      subtotal: 72,
      taxesAndFees: 7.26,
      totalAmount: 79.26,
      currency: "USD",
    },
    totalAmount: 79.26,
    status: "confirmed",
    paymentStatus: "paid",
  });

  // Completed reservation
  await Booking.create({
    bookingReference: "PK-20261018-9920",
    userId: driver1._id,
    locationId: locationDocs[1]._id,
    slotId: allSlots[18]._id,
    vehiclePlate: vehicle1.plateNumber,
    vehicleModel: `${vehicle1.make} ${vehicle1.model}`,
    vehicleType: "ev",
    startTime: new Date(now.getTime() - 1000 * 60 * 60 * 120),
    endTime: new Date(now.getTime() - 1000 * 60 * 60 * 117),
    durationHours: 3,
    pricingSnapshot: {
      hourlyRate: 5,
      hours: 3,
      subtotal: 15,
      taxesAndFees: 2.7,
      totalAmount: 17.7,
      currency: "USD",
    },
    totalAmount: 17.7,
    status: "completed",
    checkInTime: new Date(now.getTime() - 1000 * 60 * 60 * 120),
    checkOutTime: new Date(now.getTime() - 1000 * 60 * 60 * 117),
    paymentStatus: "paid",
  });

  // Notifications
  await Notification.create({
    userId: driver1._id,
    type: "booking_confirmed",
    title: "Reservation Confirmed",
    message: "Your slot A-04 at Downtown Metro Central Garage is locked. QR pass ready.",
    isRead: false,
    emailSent: false,
    emailError: "SMTP not configured - in-app notification delivered.",
  });

  // Audit Logs
  await AuditLog.create({
    action: "INITIAL_DATABASE_BOOTSTRAP",
    performedBy: admin._id,
    targetType: "System",
    details: { facilitiesCreated: locationDocs.length, slotsCreated: allSlots.length },
  });

  console.log("🎉 Seed completed successfully!");
  console.log("-----------------------------------------");
  console.log("Super Admin: admin@parksmart.io  | Password: Password123!");
  console.log("Operator 1:  operator@parksmart.io | Password: Password123!");
  console.log("Driver User: driver@parksmart.io | Password: Password123!");
  console.log("-----------------------------------------");

  await mongoose.disconnect();
}

if (require.main === module) {
  runSeed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
}
