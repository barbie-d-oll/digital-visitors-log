import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlocklist extends Document {
  name: string;
  email?: string;
  phone?: string;
  reason: string;
  type: "blocked" | "watchlist";
  organizationId: mongoose.Types.ObjectId;
  addedBy: mongoose.Types.ObjectId;
  status: "active" | "removed";
  createdAt: Date;
  updatedAt: Date;
}

const BlocklistSchema = new Schema<IBlocklist>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    reason: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["blocked", "watchlist"],
      default: "blocked",
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
    },
  },
  { timestamps: true }
);

BlocklistSchema.index({ organizationId: 1, status: 1 });
BlocklistSchema.index({ organizationId: 1, name: 1 });
BlocklistSchema.index({ organizationId: 1, phone: 1 });

const Blocklist: Model<IBlocklist> =
  mongoose.models.Blocklist ||
  mongoose.model<IBlocklist>("Blocklist", BlocklistSchema);

export default Blocklist;
