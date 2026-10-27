import mongoose, { Schema, Model, Types } from "mongoose";

export interface IVehicle {
  userId: Types.ObjectId;
  plateNumber: string;
  make: string;
  model: string;
  color?: string;
  vehicleType: "car" | "motorcycle" | "ev" | "accessible";
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plateNumber: { type: String, required: true, uppercase: true, trim: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
    vehicleType: {
      type: String,
      enum: ["car", "motorcycle", "ev", "accessible"],
      default: "car",
    },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

VehicleSchema.index({ userId: 1, plateNumber: 1 }, { unique: true });

export const Vehicle: Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model<IVehicle>("Vehicle", VehicleSchema);
