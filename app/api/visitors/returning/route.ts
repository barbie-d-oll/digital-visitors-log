import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import Visitor from "@/lib/models/visitor.model";
import Organization from "@/lib/models/organization.model";

/**
 * Public route — checks if a visitor has been here before by phone number.
 * Returns their previous details for quick re-check-in.
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const { phone, organizationSlug } = body;

    if (!phone?.trim() || !organizationSlug?.trim()) {
      return NextResponse.json(
        { ok: true, found: false },
      );
    }

    const organization = await Organization.findOne({
      slug: organizationSlug.trim().toLowerCase(),
      status: "active",
    });

    if (!organization) {
      return NextResponse.json({ ok: true, found: false });
    }

    // Find the most recent visit by this phone number
    const previousVisit = await Visitor.findOne({
      phone: phone.trim(),
      organizationId: organization._id,
    })
      .sort({ createdAt: -1 })
      .select("name email phone company purpose staff")
      .lean();

    if (!previousVisit) {
      return NextResponse.json({ ok: true, found: false });
    }

    return NextResponse.json({
      ok: true,
      found: true,
      visitor: {
        name: previousVisit.name,
        email: previousVisit.email,
        phone: previousVisit.phone,
        company: previousVisit.company,
        purpose: previousVisit.purpose,
        staff: previousVisit.staff,
      },
    });
  } catch (error) {
    console.error("Returning visitor lookup error:", error);
    return NextResponse.json({ ok: true, found: false });
  }
}
