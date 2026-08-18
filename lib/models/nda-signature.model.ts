import mongoose, { Schema, Document, Model } from "mongoose";

export interface INdaSignature extends Document {
  visitorId: mongoose.Types.ObjectId;
  visitorName: string;
  organizationId: mongoose.Types.ObjectId;
  documentTitle: string;
  documentText: string;
  signedAt: Date;
  signature: string; // base64 signature image or typed name
  signatureType: "typed" | "drawn";
  ipAddress?: string;
  createdAt: Date;
}

const NdaSignatureSchema = new Schema<INdaSignature>(
  {
    visitorId: {
      type: Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
    },
    visitorName: { type: String, required: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    documentTitle: { type: String, required: true },
    documentText: { type: String, required: true },
    signedAt: { type: Date, default: Date.now },
    signature: { type: String, required: true },
    signatureType: {
      type: String,
      enum: ["typed", "drawn"],
      default: "typed",
    },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

NdaSignatureSchema.index({ organizationId: 1, createdAt: -1 });
NdaSignatureSchema.index({ visitorId: 1 });

const NdaSignature: Model<INdaSignature> =
  mongoose.models.NdaSignature ||
  mongoose.model<INdaSignature>("NdaSignature", NdaSignatureSchema);

export default NdaSignature;
