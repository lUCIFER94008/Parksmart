import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: "booking_confirmed" | "booking_cancelled" | "check_in" | "check_out" | "reminder" | "system";
  title: string;
  message: string;
  isRead: boolean;
  emailSent: boolean;
  emailError?: string;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["booking_confirmed", "booking_cancelled", "check_in", "check_out", "reminder", "system"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    emailError: { type: String },
    link: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
