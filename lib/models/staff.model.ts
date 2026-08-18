import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStaff extends Document {
  name: string;
  email: string;
  phone?: string;
  departmentId?: mongoose.Types.ObjectId;
  position?: string;
  organizationId: mongoose.Types.ObjectId;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    position: { type: String, trim: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

StaffSchema.index({ organizationId: 1 });
StaffSchema.index({ organizationId: 1, email: 1 }, { unique: true });
StaffSchema.index({ departmentId: 1 });

const Staff: Model<IStaff> =
  mongoose.models.Staff || mongoose.model<IStaff>("Staff", StaffSchema);

export default Staff;
