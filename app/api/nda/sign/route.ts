import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import NdaSignature from "@/lib/models/nda-signature.model";
import Organization from "@/lib/models/organization.model";

/**
 * Public route — visitor signs the NDA during check-in.
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const { visitorId, visitorName, organizationSlug, signature, signatureType } = body;

    if (!visitorId || !visitorName?.trim() || !signature || !organizationSlug) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const organization = await Organization.findOne({
      slug: organizationSlug.trim().toLowerCase(),
      status: "active",
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found." }, { status: 404 });
    }

    if (!organization.settings?.requireNda || !organization.settings.ndaText) {
      return NextResponse.json({ error: "NDA not configured for this organization." }, { status: 400 });
    }

    const ndaSignature = await NdaSignature.create({
      visitorId,
      visitorName: visitorName.trim(),
      organizationId: organization._id,
      documentTitle: "Non-Disclosure Agreement",
      documentText: organization.settings.ndaText,
      signature,
      signatureType: signatureType || "typed",
      ipAddress: request.headers.get("x-forwarded-for") || "",
    });

    return NextResponse.json({ ok: true, signatureId: ndaSignature._id }, { status: 201 });
  } catch (error) {
    console.error("NDA sign error:", error);
    return NextResponse.json(
      { error: "Failed to save signature." },
      { status: 500 }
    );
  }
}
