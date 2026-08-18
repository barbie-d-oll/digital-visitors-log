import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Organization from "@/lib/models/organization.model";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const organization = await Organization.findById(
      authUser.organizationId
    ).lean();

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, organization });
  } catch (error) {
    console.error("Get organization error:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (authUser.role !== "owner") {
      return NextResponse.json(
        { error: "Only the organization owner can update settings." },
        { status: 403 }
      );
    }

    await connectToDB();

    const body = await request.json();

    // Only allow specific fields to be updated
    const allowedFields = [
      "name",
      "phone",
      "address",
      "logo",
      "settings",
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    const organization = await Organization.findByIdAndUpdate(
      authUser.organizationId,
      { $set: updates },
      { new: true }
    ).lean();

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, organization });
  } catch (error) {
    console.error("Update organization error:", error);
    return NextResponse.json(
      { error: "Failed to update organization." },
      { status: 500 }
    );
  }
}
