import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAppointment extends Document {
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitorCompany?: string;
  purpose: string;
  hostId: mongoose.Types.ObjectId;
  hostName: string;
  organizationId: mongoose.Types.ObjectId;
  scheduledDate: Date;
  scheduledTime: string;
  expectedDuration?: number; // minutes
  status: "scheduled" | "checked_in" | "completed" | "cancelled" | "no_show";
  notes?: string;
  preRegCode?: string;
  visitorId?: mongoose.Types.ObjectId; // linked when visitor actually checks in
  notificationSent: boolean;
  reminderSent: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    visitorName: { type: String, required: true, trim: true },
    visitorEmail: { type: String, trim: true, lowercase: true },
    visitorPhone: { type: String, trim: true },
    visitorCompany: { type: String, trim: true },
    purpose: { type: String, required: true },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    hostName: { type: String, required: true, trim: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    expectedDuration: { type: Number },
    status: {
      type: String,
      enum: ["scheduled", "checked_in", "completed", "cancelled", "no_show"],
      default: "scheduled",
    },
    notes: { type: String, trim: true },
    preRegCode: { type: String },
    visitorId: { type: Schema.Types.ObjectId, ref: "Visitor" },
    notificationSent: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

AppointmentSchema.index({ organizationId: 1, scheduledDate: -1 });
AppointmentSchema.index({ organizationId: 1, status: 1 });
AppointmentSchema.index({ organizationId: 1, hostId: 1 });
AppointmentSchema.index({ organizationId: 1, preRegCode: 1 });
AppointmentSchema.index({ visitorEmail: 1, organizationId: 1 });

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
