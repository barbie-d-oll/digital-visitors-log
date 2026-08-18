import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVisitor extends Document {
  name: string;
  phone: string;
  company?: string;
  purpose: string;
  staff: string;
  visitorCode: string;
  status: "Checked In" | "Signed Out" | "Checked Out";
  organizationId: mongoose.Types.ObjectId;
  locationId?: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut?: Date;
  smsStatus: "Unpremised" | "Sent" | "Failed";
  smsSentAt?: Date;
  smsError?: string;
  ndaSigned: boolean;
  ndaSignatureId?: mongoose.Types.ObjectId;
  isReturning: boolean;
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    purpose: { type: String, required: true },
    staff: { type: String, required: true, trim: true },
    visitorCode: { type: String, required: true },
    status: {
      type: String,
      enum: ["Checked In", "Signed Out", "Checked Out"],
      default: "Checked In",
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    locationId: { type: Schema.Types.ObjectId, ref: "Location" },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    checkIn: { type: Date, default: Date.now },
    checkOut: { type: Date },
    smsStatus: {
      type: String,
      enum: ["Unpremised", "Sent", "Failed"],
      default: "Unpremised",
    },
    smsSentAt: { type: Date },
    smsError: { type: String },
    ndaSigned: { type: Boolean, default: false },
    ndaSignatureId: { type: Schema.Types.ObjectId, ref: "NdaSignature" },
    isReturning: { type: Boolean, default: false },
    photo: { type: String },
  },
  { timestamps: true }
);

VisitorSchema.index({ organizationId: 1, createdAt: -1 });
VisitorSchema.index({ organizationId: 1, visitorCode: 1 });
VisitorSchema.index({ organizationId: 1, status: 1 });
VisitorSchema.index({ organizationId: 1, locationId: 1 });
VisitorSchema.index({ organizationId: 1, phone: 1 });

const Visitor: Model<IVisitor> =
  mongoose.models.Visitor ||
  mongoose.model<IVisitor>("Visitor", VisitorSchema);

export default Visitor;
