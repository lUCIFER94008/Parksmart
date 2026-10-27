import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IBooking extends Document {
  bookingReference: string;
  userId: any;
  locationId: any;
  slotId: any;
  slotNumber: string;
  facilityName?: string;
  facilityAddress?: string;
  floor?: string;
  vehiclePlate: string;
  vehicleModel?: string;
  vehicleType: "car" | "motorcycle" | "ev" | "accessible";
  startTime: Date;
  endTime: Date;
  durationHours: number;
  pricingSnapshot: {
    hourlyRate: number;
    hours: number;
    subtotal: number;
    taxesAndFees: number;
    totalAmount: number;
    currency: string;
  };
  totalAmount: number;
  status: "pending" | "confirmed" | "checked_in" | "completed" | "cancelled" | "expired";
  qrCodeDataUrl?: string;
  qrSecurityToken?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingReference: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    locationId: { type: Schema.Types.Mixed, required: true, index: true },
    slotId: { type: Schema.Types.Mixed, required: true, index: true },
    slotNumber: { type: String, required: true, index: true },
    facilityName: { type: String },
    facilityAddress: { type: String },
    floor: { type: String, default: "Floor 1" },
    vehiclePlate: { type: String, required: true },
    vehicleModel: { type: String },
    vehicleType: {
      type: String,
      enum: ["car", "motorcycle", "ev", "accessible"],
      default: "car",
    },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    durationHours: { type: Number, required: true },
    pricingSnapshot: {
      hourlyRate: { type: Number, required: true },
      hours: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      taxesAndFees: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
      currency: { type: String, default: "USD" },
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "checked_in", "completed", "cancelled", "expired"],
      default: "confirmed",
      index: true,
    },
    qrCodeDataUrl: { type: String },
    qrSecurityToken: { type: String },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "paid",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for slot interval overlap searches
BookingSchema.index({ slotId: 1, startTime: 1, endTime: 1, status: 1 });
BookingSchema.index({ locationId: 1, slotNumber: 1, startTime: 1, endTime: 1, status: 1 });

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
