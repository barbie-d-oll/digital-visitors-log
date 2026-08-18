import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Visitor from "@/lib/models/visitor.model";
import Organization from "@/lib/models/organization.model";

/**
 * Generates badge data for printing a visitor badge.
 * Returns structured data that the frontend renders as a printable badge.
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = request.nextUrl;
    const visitorId = searchParams.get("visitorId");

    if (!visitorId) {
      return NextResponse.json(
        { error: "Visitor ID is required." },
        { status: 400 }
      );
    }

    const visitor = await Visitor.findOne({
      _id: visitorId,
      organizationId: authUser.organizationId,
    }).lean();

    if (!visitor) {
      return NextResponse.json({ error: "Visitor not found." }, { status: 404 });
    }

    const organization = await Organization.findById(authUser.organizationId)
      .select("name logo settings")
      .lean();

    return NextResponse.json({
      ok: true,
      badge: {
        visitorName: visitor.name,
        visitorCompany: visitor.company || "",
        visitorCode: visitor.visitorCode,
        host: visitor.staff,
        purpose: visitor.purpose,
        checkIn: visitor.checkIn,
        organizationName: organization?.name || "",
        organizationLogo: organization?.logo || organization?.settings?.logoUrl || "",
        date: new Date().toLocaleDateString(),
      },
    });
  } catch (error) {
    console.error("Badge generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate badge." },
      { status: 500 }
    );
  }
}
