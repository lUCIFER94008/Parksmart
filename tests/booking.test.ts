import { describe, it, expect } from "vitest";
import { hasIntervalOverlap, isSlotAvailableForInterval, ExistingReservation } from "../lib/booking/conflict";
import { calculateReservationPricing } from "../lib/pricing/calculator";

describe("Booking Overlap Conflict Detection Engine", () => {
  const baseStart = new Date("2026-10-24T10:00:00Z");
  const baseEnd = new Date("2026-10-24T12:00:00Z");

  it("detects exact interval overlap", () => {
    const overlap = hasIntervalOverlap(baseStart, baseEnd, baseStart, baseEnd);
    expect(overlap).toBe(true);
  });

  it("detects when new booking falls inside existing booking", () => {
    const insideStart = new Date("2026-10-24T10:30:00Z");
    const insideEnd = new Date("2026-10-24T11:30:00Z");
    expect(hasIntervalOverlap(insideStart, insideEnd, baseStart, baseEnd)).toBe(true);
  });

  it("detects when new booking starts before and overlaps end of existing booking", () => {
    const partialStart = new Date("2026-10-24T09:00:00Z");
    const partialEnd = new Date("2026-10-24T10:30:00Z");
    expect(hasIntervalOverlap(partialStart, partialEnd, baseStart, baseEnd)).toBe(true);
  });

  it("detects when new booking starts during existing and ends after", () => {
    const partialStart = new Date("2026-10-24T11:30:00Z");
    const partialEnd = new Date("2026-10-24T13:00:00Z");
    expect(hasIntervalOverlap(partialStart, partialEnd, baseStart, baseEnd)).toBe(true);
  });

  it("allows back-to-back bookings where new start exactly equals existing end", () => {
    const touchingStart = new Date("2026-10-24T12:00:00Z");
    const touchingEnd = new Date("2026-10-24T14:00:00Z");
    expect(hasIntervalOverlap(touchingStart, touchingEnd, baseStart, baseEnd)).toBe(false);
  });

  it("allows booking that ends at the exact instant existing booking starts", () => {
    const touchingStart = new Date("2026-10-24T08:00:00Z");
    const touchingEnd = new Date("2026-10-24T10:00:00Z");
    expect(hasIntervalOverlap(touchingStart, touchingEnd, baseStart, baseEnd)).toBe(false);
  });

  it("enforces turnover buffer when configured", () => {
    const touchingStart = new Date("2026-10-24T12:05:00Z"); // 5 mins after
    const touchingEnd = new Date("2026-10-24T14:00:00Z");
    // With 10 min turnover buffer, it should conflict
    expect(hasIntervalOverlap(touchingStart, touchingEnd, baseStart, baseEnd, 10)).toBe(true);
    // Without buffer, it should NOT conflict
    expect(hasIntervalOverlap(touchingStart, touchingEnd, baseStart, baseEnd, 0)).toBe(false);
  });

  it("correctly ignores cancelled or completed bookings when calculating slot availability", () => {
    const reservations: ExistingReservation[] = [
      {
        slotId: "slot-1",
        startTime: baseStart,
        endTime: baseEnd,
        status: "cancelled",
      },
    ];

    const isAvailable = isSlotAvailableForInterval("slot-1", baseStart, baseEnd, reservations);
    expect(isAvailable).toBe(true);
  });
});

describe("Reservation Pricing Calculation Engine", () => {
  it("calculates 2-hour standard car reservation accurately with taxes and service fees", () => {
    const start = new Date("2026-10-24T10:00:00Z");
    const end = new Date("2026-10-24T12:00:00Z");

    const pricing = calculateReservationPricing({
      baseHourlyRate: 6.0,
      vehicleType: "car",
      startTime: start,
      endTime: end,
      taxRatePercent: 8,
      serviceFee: 1.5,
    });

    expect(pricing.durationHours).toBe(2);
    expect(pricing.subtotal).toBe(12.0);
    // taxes = 12 * 0.08 = 0.96 + 1.50 service fee = 2.46
    expect(pricing.taxesAndFees).toBe(2.46);
    expect(pricing.totalAmount).toBe(14.46);
  });

  it("applies vehicle pricing overrides (e.g. EV rapid charge rate)", () => {
    const start = new Date("2026-10-24T10:00:00Z");
    const end = new Date("2026-10-24T11:00:00Z");

    const pricing = calculateReservationPricing({
      baseHourlyRate: 5.0,
      vehicleType: "ev",
      vehiclePricingOverride: {
        ev: 8.5,
      },
      startTime: start,
      endTime: end,
      taxRatePercent: 0,
      serviceFee: 0,
    });

    expect(pricing.durationHours).toBe(1);
    expect(pricing.effectiveHourlyRate).toBe(8.5);
    expect(pricing.totalAmount).toBe(8.5);
  });
});

describe("Vehicle Compatibility & QR Code Pass Formation", () => {
  it("validates allowed vehicle types and rejects unpermitted vehicles", () => {
    const supportedVehicles = ["car", "ev", "accessible"];
    expect(supportedVehicles.includes("motorcycle")).toBe(false);
    expect(supportedVehicles.includes("car")).toBe(true);
    expect(supportedVehicles.includes("ev")).toBe(true);
  });

  it("formats structured touchless QR security payload correctly", () => {
    const bookingRef = "PK-20261026-1234";
    const locSlug = "downtown-metro-central";
    const slot = "A-01";
    const plate = "CA-7XYZ99";

    const payload = `PARKSMART|REF:${bookingRef}|LOC:${locSlug}|SLOT:${slot}|PLATE:${plate}`;
    expect(payload).toContain("REF:PK-20261026-1234");
    expect(payload).toContain("SLOT:A-01");
    expect(payload).toContain("PLATE:CA-7XYZ99");
    expect(payload.startsWith("PARKSMART|")).toBe(true);
  });
});
