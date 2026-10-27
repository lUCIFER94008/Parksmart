import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IParkingSlot extends Document {
  locationId: Types.ObjectId;
  slotNumber: string;
  floor: string;
  vehicleType: "car" | "motorcycle" | "ev" | "accessible";
  status: "available" | "occupied" | "reserved" | "maintenance";
  hourlyRateOverride?: number;
  maintenanceReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParkingSlotSchema = new Schema<IParkingSlot>(
  {
    locationId: { type: Schema.Types.ObjectId, ref: "ParkingLocation", required: true, index: true },
    slotNumber: { type: String, required: true },
    floor: { type: String, required: true, default: "Floor 1" },
    vehicleType: {
      type: String,
      enum: ["car", "motorcycle", "ev", "accessible"],
      default: "car",
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "maintenance"],
      default: "available",
      required: true,
      index: true,
    },
    hourlyRateOverride: { type: Number },
    maintenanceReason: { type: String },
  },
  {
    timestamps: true,
  }
);

ParkingSlotSchema.index({ locationId: 1, slotNumber: 1 }, { unique: true });

export const ParkingSlot: Model<IParkingSlot> =
  mongoose.models.ParkingSlot ||
  mongoose.model<IParkingSlot>("ParkingSlot", ParkingSlotSchema);
