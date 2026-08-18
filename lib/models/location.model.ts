import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILocation extends Document {
  name: string;
  address: string;
  organizationId: mongoose.Types.ObjectId;
  phone?: string;
  timezone?: string;
  status: "active" | "inactive";
  settings: {
    kioskMode: boolean;
    kioskPin?: string;
    customWelcomeMessage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    phone: { type: String, trim: true },
    timezone: { type: String, default: "Africa/Accra" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    settings: {
      kioskMode: { type: Boolean, default: false },
      kioskPin: { type: String },
      customWelcomeMessage: { type: String },
    },
  },
  { timestamps: true }
);

LocationSchema.index({ organizationId: 1 });
LocationSchema.index({ organizationId: 1, name: 1 }, { unique: true });

const Location: Model<ILocation> =
  mongoose.models.Location ||
  mongoose.model<ILocation>("Location", LocationSchema);

export default Location;
