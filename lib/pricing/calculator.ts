export interface PricingInput {
  baseHourlyRate: number;
  dailyMaxRate?: number;
  vehicleType?: "car" | "motorcycle" | "ev" | "accessible";
  vehiclePricingOverride?: {
    car?: number;
    motorcycle?: number;
    ev?: number;
    accessible?: number;
  };
  startTime: Date;
  endTime: Date;
  taxRatePercent?: number; // e.g. 8 for 8%
  serviceFee?: number;
}

export interface PricingBreakdown {
  durationHours: number;
  effectiveHourlyRate: number;
  subtotal: number;
  serviceFee: number;
  taxesAndFees: number;
  totalAmount: number;
  currency: string;
}

export function calculateReservationPricing(input: PricingInput): PricingBreakdown {
  const {
    baseHourlyRate,
    dailyMaxRate,
    vehicleType = "car",
    vehiclePricingOverride,
    startTime,
    endTime,
    taxRatePercent = 8,
    serviceFee = 1.50,
  } = input;

  const diffMs = endTime.getTime() - startTime.getTime();
  if (diffMs <= 0) {
    throw new Error("End time must be after start time");
  }

  // Calculate duration in hours, rounded up to whole hour
  const durationHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));

  // Determine effective hourly rate based on vehicle type
  let effectiveHourlyRate = baseHourlyRate;
  if (vehiclePricingOverride && vehiclePricingOverride[vehicleType] !== undefined) {
    effectiveHourlyRate = vehiclePricingOverride[vehicleType]!;
  }

  // Apply daily max rate cap if booking spans full days
  let subtotal = 0;
  if (dailyMaxRate && dailyMaxRate > 0) {
    const fullDays = Math.floor(durationHours / 24);
    const remainingHours = durationHours % 24;
    const remainingSubtotal = Math.min(remainingHours * effectiveHourlyRate, dailyMaxRate);
    subtotal = (fullDays * dailyMaxRate) + remainingSubtotal;
  } else {
    subtotal = durationHours * effectiveHourlyRate;
  }

  const taxesAndFees = Number(((subtotal * (taxRatePercent / 100)) + serviceFee).toFixed(2));
  const totalAmount = Number((subtotal + taxesAndFees).toFixed(2));

  return {
    durationHours,
    effectiveHourlyRate,
    subtotal: Number(subtotal.toFixed(2)),
    serviceFee,
    taxesAndFees,
    totalAmount,
    currency: "USD",
  };
}
