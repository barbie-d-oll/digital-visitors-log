import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Organization from "@/lib/models/organization.model";

function normalizeLogoUrl(value: string) {
  const logoUrl = value.trim();

  if (!logoUrl) {
    return "";
  }

  if (logoUrl.startsWith("/") && !logoUrl.startsWith("//")) {
    return logoUrl;
  }

  try {
    const parsedUrl = new URL(logoUrl);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return logoUrl;
    }
  } catch {
    return null;
  }

  return null;
}

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

    const body = (await request.json()) as Record<string, unknown>;
    const settings =
      body.settings &&
      typeof body.settings === "object" &&
      !Array.isArray(body.settings)
        ? { ...(body.settings as Record<string, unknown>) }
        : undefined;

    // Only allow specific fields to be updated
    const allowedFields = [
      "name",
      "phone",
      "address",
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    let logoUrl =
      typeof body.logo === "string" ? body.logo : undefined;

    if (typeof settings?.logoUrl === "string" && logoUrl === undefined) {
      logoUrl = settings.logoUrl;
    }

    if (logoUrl !== undefined) {
      const normalizedLogoUrl = normalizeLogoUrl(logoUrl);

      if (normalizedLogoUrl === null) {
        return NextResponse.json(
          { error: "Logo must be a valid http, https, or local image path." },
          { status: 400 },
        );
      }

      updates.logo = normalizedLogoUrl;
      if (settings) {
        settings.logoUrl = normalizedLogoUrl;
      }
    }

    if (settings) {
      updates.settings = settings;
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
