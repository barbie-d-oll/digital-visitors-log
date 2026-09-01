import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;

  // Commercial plan
  plan: "starter" | "business" | "enterprise";

  status: "active" | "inactive" | "suspended";

  settings: {
    smsEnabled: boolean;
    smsSenderId?: string;
    smsApiKey?: string;

    visitPurposes: string[];

    requireCompany: boolean;
    autoCheckoutHours?: number;

    emailNotifications: boolean;

    slackWebhookUrl?: string;
    teamsWebhookUrl?: string;

    notifyHostOnArrival: boolean;

    requireNda: boolean;
    ndaText?: string;

    customBranding: boolean;
    primaryColor?: string;
    logoUrl?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    logo: {
      type: String,
    },

    // =========================
    // COMMERCIAL PLAN
    // =========================
    plan: {
      type: String,
      enum: ["starter", "business", "enterprise"],
      default: "starter",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    // =========================
    // ORGANIZATION SETTINGS
    // =========================
    settings: {
      smsEnabled: {
        type: Boolean,
        default: false,
      },

      smsSenderId: {
        type: String,
      },

      smsApiKey: {
        type: String,
        select: false,
      },

      visitPurposes: {
        type: [String],
        default: [
          "Meeting",
          "Delivery",
          "Interview",
          "Event",
          "Other",
        ],
      },

      requireCompany: {
        type: Boolean,
        default: false,
      },

      autoCheckoutHours: {
        type: Number,
      },

      emailNotifications: {
        type: Boolean,
        default: true,
      },

      slackWebhookUrl: {
        type: String,
      },

      teamsWebhookUrl: {
        type: String,
      },

      notifyHostOnArrival: {
        type: Boolean,
        default: true,
      },

      requireNda: {
        type: Boolean,
        default: false,
      },

      ndaText: {
        type: String,
      },

      customBranding: {
        type: Boolean,
        default: false,
      },

      primaryColor: {
        type: String,
      },

      logoUrl: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// INDEXES
// =========================

OrganizationSchema.index({ slug: 1 });
OrganizationSchema.index({ status: 1 });
OrganizationSchema.index({ plan: 1 });

const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);

export default Organization;