import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: "owner" | "admin" | "staff";
  organizationId: mongoose.Types.ObjectId;
  googleId?: string;
  authProvider: "credentials" | "google";
  status: "active" | "inactive";
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, select: false },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["owner", "admin", "staff"],
      default: "admin",
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    googleId: { type: String },
    authProvider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1, organizationId: 1 }, { unique: true });
UserSchema.index({ organizationId: 1 });
UserSchema.index({ googleId: 1 }, { sparse: true });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
