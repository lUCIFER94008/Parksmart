import mongoose from "mongoose";
import { Booking } from "../models/Booking";
import { ParkingLocation } from "../models/ParkingLocation";
import { ParkingSlot } from "../models/ParkingSlot";

const BASE_URL = "http://localhost:3000";

async function main() {
  console.log("🚀 Starting ParkSmart E2E Verification Script...");

  const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin123@cluster0.qfhlmp1.mongodb.net/parksamart";
  console.log("🔌 Connecting to MongoDB Atlas for persistence verification...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ MongoDB Atlas connected successfully.");

  // Test 1: Fetch Facilities & Verify Vehicle Compatibility
  console.log("\n🧪 Test 1: Testing facility vehicle support...");
  const locRes = await fetch(`${BASE_URL}/api/parking`);
  const locJson = await locRes.json();
  if (!locJson.success || !locJson.data) {
    throw new Error("Failed to fetch parking locations");
  }
  console.log(`✅ Retrieved ${locJson.data.length} parking locations.`);
  
  const techPlaza = locJson.data.find((l: any) => l.id === "loc-tech-plaza" || l.slug === "tech-plaza-smart-bay");
  console.log("Tech Plaza supported vehicles:", techPlaza.supportedVehicles);

  // Test 2: Incompatible Vehicle Rejection
  console.log("\n🧪 Test 2: Testing incompatible vehicle rejection on facility...");
  const incompRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      locationId: techPlaza.id,
      slotNumber: "A-01",
      vehiclePlate: "MOTO-999",
      vehicleType: "motorcycle", // Tech Plaza only supports car, ev, accessible
      startTime: new Date(Date.now() + 3600000).toISOString(),
      endTime: new Date(Date.now() + 7200000).toISOString(),
    }),
  });
  const incompJson = await incompRes.json();
  if (incompRes.status === 400 && !incompJson.success) {
    console.log("✅ Correctly rejected unsupported motorcycle on Tech Plaza:", incompJson.error);
  } else {
    throw new Error(`Expected 400 rejection for unsupported vehicle, got status ${incompRes.status}: ${JSON.stringify(incompJson)}`);
  }

  // Test 3: Successful Booking & Persistence to MongoDB Atlas
  console.log("\n🧪 Test 3: Creating a valid reservation and persisting to MongoDB Atlas...");
  const startTime = new Date(Date.now() + 7200000); // 2 hours in future
  const endTime = new Date(Date.now() + 14400000); // 4 hours in future
  const testSlotNumber = "A-02"; // EV slot on Floor 1
  const testPlate = "E2E-TEST99";

  const bookingRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      locationId: "loc-downtown-metro",
      slotNumber: testSlotNumber,
      vehiclePlate: testPlate,
      vehicleType: "ev",
      vehicleModel: "Tesla Model Y",
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    }),
  });

  const bookingJson = await bookingRes.json();
  if (!bookingRes.ok || !bookingJson.success) {
    throw new Error(`Booking creation failed: ${JSON.stringify(bookingJson)}`);
  }

  const createdData = bookingJson.data;
  console.log("✅ Booking API returned success!");
  console.log("   Reference:", createdData.bookingReference);
  console.log("   Slot:", createdData.slotNumber);
  console.log("   Total Amount: $" + createdData.totalAmount);
  console.log("   QR Code Data URL exists:", !!createdData.qrCodeDataUrl);
  console.log("   QR Payload:", createdData.qrPayload);

  // Test 4: Verify Direct Document in MongoDB Atlas
  console.log("\n🧪 Test 4: Verifying direct document persistence in MongoDB Atlas collection...");
  const dbBooking = await Booking.findOne({ bookingReference: createdData.bookingReference });
  if (!dbBooking) {
    throw new Error(`CRITICAL: Booking ${createdData.bookingReference} not found in MongoDB Atlas!`);
  }
  console.log("✅ Booking found in MongoDB Atlas!");
  console.log("   MongoDB _id:", dbBooking._id.toString());
  console.log("   Status:", dbBooking.status);
  console.log("   Vehicle Plate:", dbBooking.vehiclePlate);
  console.log("   Duration Hours:", dbBooking.durationHours);
  console.log("   Total Amount:", dbBooking.totalAmount);

  // Test 5: Conflict Overlap Rejection
  console.log("\n🧪 Test 5: Attempting conflicting booking for same slot and overlapping interval...");
  const overlapRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      locationId: "loc-downtown-metro",
      slotNumber: testSlotNumber,
      vehiclePlate: "CONFLICT-1",
      vehicleType: "ev",
      startTime: new Date(startTime.getTime() + 1800000).toISOString(), // 30 min into existing
      endTime: new Date(endTime.getTime() + 1800000).toISOString(),
    }),
  });

  const overlapJson = await overlapRes.json();
  if (overlapRes.status === 409 && !overlapJson.success) {
    console.log("✅ Overlapping conflict correctly rejected (409):", overlapJson.error);
  } else {
    throw new Error(`Expected 409 conflict rejection, got ${overlapRes.status}: ${JSON.stringify(overlapJson)}`);
  }

  // Test 6: Validate QR Pass with Operator Endpoint
  console.log("\n🧪 Test 6: Validating QR Pass via POST /api/operator/validate-qr...");
  const validateRes = await fetch(`${BASE_URL}/api/operator/validate-qr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      qrPayloadOrReference: createdData.qrPayload || createdData.bookingReference,
    }),
  });

  const validateJson = await validateRes.json();
  if (validateRes.ok && validateJson.success && validateJson.valid) {
    console.log("✅ QR Pass successfully validated by operator service!");
    console.log("   Validated Booking Reference:", validateJson.data.bookingReference);
    console.log("   Status:", validateJson.data.status);
  } else {
    throw new Error(`QR validation failed: ${JSON.stringify(validateJson)}`);
  }

  console.log("\n🎉 ALL E2E BACKEND & DATABASE TESTS PASSED SUCCESSFULLY!\n");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ E2E Verification failed:", err);
  process.exit(1);
});
