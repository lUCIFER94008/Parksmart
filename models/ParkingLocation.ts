import mongoose, { Schema, Document, Model } from "mongoose";

export interface IParkingLocation extends Document {
  name: string;
  slug: string;
  tagline: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  images: string[];
  hourlyRate: number;
  dailyRate: number;
  vehiclePricing: {
    car: number;
    motorcycle: number;
    ev: number;
    accessible: number;
  };
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  reservedSlots: number;
  rating: number;
  reviewCount: number;
  openingHours: {
    open: string;
    close: string;
    is24_7: boolean;
  };
  amenities: string[];
  supportedVehicles: ("car" | "motorcycle" | "ev" | "accessible")[];
  isActive: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ParkingLocationSchema = new Schema<IParkingLocation>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tagline: { type: String, required: true },
    description: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    images: [{ type: String }],
    hourlyRate: { type: Number, required: true, min: 0 },
    dailyRate: { type: Number, required: true, min: 0 },
    vehiclePricing: {
      car: { type: Number, default: 5 },
      motorcycle: { type: Number, default: 3 },
      ev: { type: Number, default: 7 },
      accessible: { type: Number, default: 5 },
    },
    totalSlots: { type: Number, required: true, default: 0 },
    availableSlots: { type: Number, required: true, default: 0 },
    occupiedSlots: { type: Number, required: true, default: 0 },
    reservedSlots: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    openingHours: {
      open: { type: String, default: "00:00" },
      close: { type: String, default: "23:59" },
      is24_7: { type: Boolean, default: true },
    },
    amenities: [{ type: String }],
    supportedVehicles: [{ type: String, enum: ["car", "motorcycle", "ev", "accessible"] }],
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

ParkingLocationSchema.index({ "location.coordinates": "2dsphere" });

export const ParkingLocation: Model<IParkingLocation> =
  mongoose.models.ParkingLocation ||
  mongoose.model<IParkingLocation>("ParkingLocation", ParkingLocationSchema);
