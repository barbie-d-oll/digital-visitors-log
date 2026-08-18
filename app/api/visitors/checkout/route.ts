import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import Visitor from "@/lib/models/visitor.model";
import { logEvent } from "@/lib/audit";

/**
 * Public route — visitors sign out with their code.
 * No auth required, but the visitorCode + organizationId (via slug) is needed.
 */
export async function POST(request: Request) {
  try {
    await connectToDB();

    const body = await request.json();
    const { visitorCode, organizationSlug } = body;

    if (!visitorCode?.trim()) {
      return NextResponse.json(
        { error: "Visitor code is required." },
        { status: 400 }
      );
    }

    if (!organizationSlug?.trim()) {
      return NextResponse.json(
        { error: "Organization is required." },
        { status: 400 }
      );
    }

    // Import organization model to resolve slug
    const { default: Organization } = await import(
      "@/lib/models/organization.model"
    );

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
    });

    if (!visitor) {
      return NextResponse.json(
        { error: "No visitor found with that code." },
        { status: 404 }
      );
    }

    if (visitor.status === "Signed Out" || visitor.status === "Checked Out") {
      return NextResponse.json(
        { error: "This visitor has already signed out." },
        { status: 400 }
      );
    }

    visitor.status = "Signed Out";
    visitor.checkOut = new Date();
    await visitor.save();

    // Audit log
    logEvent({
      action: "visitor.checked_out",
      entity: "visitor",
      entityId: visitor._id.toString(),
      organizationId: organization._id.toString(),
      details: { visitorName: visitor.name, visitorCode: visitor.visitorCode },
    }).catch(() => {});

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
        checkOut: visitor.checkOut,
        status: visitor.status,
      },
    });
  } catch (error) {
    console.error("Visitor checkout error:", error);
    return NextResponse.json(
      { error: "Failed to sign out visitor." },
      { status: 500 }
    );
  }
}
