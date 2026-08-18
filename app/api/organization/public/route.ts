import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import Organization from "@/lib/models/organization.model";

/**
 * Public route — returns limited org settings needed by the public registration page.
 * Only returns non-sensitive information (NDA text, visit purposes, branding).
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Slug required." }, { status: 400 });
    }

    const org = await Organization.findOne({
      slug: slug.trim().toLowerCase(),
      status: "active",
    })
      .select("name settings.requireNda settings.ndaText settings.visitPurposes settings.requireCompany settings.customBranding settings.primaryColor settings.logoUrl")
      .lean();

    if (!org) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      name: org.name,
      ndaText: org.settings?.requireNda ? org.settings.ndaText : null,
      visitPurposes: org.settings?.visitPurposes || ["Meeting", "Delivery", "Interview", "Event", "Other"],
      requireCompany: org.settings?.requireCompany || false,
      branding: org.settings?.customBranding
        ? { primaryColor: org.settings.primaryColor, logoUrl: org.settings.logoUrl }
        : null,
    });
  } catch (error) {
    console.error("Public org error:", error);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
