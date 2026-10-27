import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IParkingSession extends Document {
  bookingId: Types.ObjectId;
  locationId: Types.ObjectId;
  slotId: Types.ObjectId;
  vehiclePlate: string;
  operatorCheckInId?: Types.ObjectId;
  operatorCheckOutId?: Types.ObjectId;
  checkInTime: Date;
  checkOutTime?: Date;
  durationMinutes?: number;
  status: "active" | "completed" | "overstay";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParkingSessionSchema = new Schema<IParkingSession>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: "ParkingLocation", required: true, index: true },
    slotId: { type: Schema.Types.ObjectId, ref: "ParkingSlot", required: true },
    vehiclePlate: { type: String, required: true },
    operatorCheckInId: { type: Schema.Types.ObjectId, ref: "User" },
    operatorCheckOutId: { type: Schema.Types.ObjectId, ref: "User" },
    checkInTime: { type: Date, required: true, default: Date.now },
    checkOutTime: { type: Date },
    durationMinutes: { type: Number },
    status: {
      type: String,
      enum: ["active", "completed", "overstay"],
      default: "active",
      index: true,
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const ParkingSession: Model<IParkingSession> =
  mongoose.models.ParkingSession ||
  mongoose.model<IParkingSession>("ParkingSession", ParkingSessionSchema);
