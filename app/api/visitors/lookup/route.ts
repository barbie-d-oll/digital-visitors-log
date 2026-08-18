import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import Visitor from "@/lib/models/visitor.model";
import Organization from "@/lib/models/organization.model";

/**
 * Public route — lookup a visitor by code for the sign-out page.
 * No auth required, used by the public logout flow.
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const { visitorCode, organizationSlug } = body;

    if (!visitorCode?.trim() || !organizationSlug?.trim()) {
      return NextResponse.json(
        { error: "Visitor code and organization are required." },
        { status: 400 }
      );
    }

    const organization = await Organization.findOne({
      slug: organizationSlug.trim().toLowerCase(),
      status: "active",
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found." },
        { status: 404 }
      );
    }

    const visitor = await Visitor.findOne({
      visitorCode: visitorCode.trim().toUpperCase(),
      organizationId: organization._id,
    }).lean();

    if (!visitor) {
      return NextResponse.json(
        { error: "No visitor found with that code." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      visitor: {
        id: visitor._id,
        name: visitor.name,
        phone: visitor.phone,
        company: visitor.company,
        purpose: visitor.purpose,
        staff: visitor.staff,
        visitorCode: visitor.visitorCode,
        checkIn: visitor.checkIn,
        status: visitor.status,
      },
    });
  } catch (error) {
    console.error("Visitor lookup error:", error);
    return NextResponse.json(
      { error: "Failed to look up visitor." },
      { status: 500 }
    );
  }
}
