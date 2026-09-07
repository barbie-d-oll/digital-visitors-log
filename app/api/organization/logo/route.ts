import { NextRequest, NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth/jwt";
import { connectToDB } from "@/lib/db/mongoose";
import Organization from "@/lib/models/organization.model";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (authUser.role !== "owner") {
      return NextResponse.json(
        { error: "Only the organization owner can update the logo." },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const logo = formData.get("logo");

    if (!logo || typeof logo === "string") {
      return NextResponse.json(
        { error: "Please choose an image file." },
        { status: 400 },
      );
    }

    const extension = ALLOWED_LOGO_TYPES.get(logo.type);
    if (!extension) {
      return NextResponse.json(
        { error: "Logo must be a PNG, JPG, WEBP, or GIF image." },
        { status: 400 },
      );
    }

    if (logo.size > MAX_LOGO_SIZE) {
      return NextResponse.json(
        { error: "Logo must be 2MB or smaller." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await logo.arrayBuffer());
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: "digital-visitors-log/organization-logos",
      public_id: `${authUser.organizationId}-logo`,
      overwrite: true,
      invalidate: true,
    });
    const logoUrl = uploadResult.secure_url;

    await connectToDB();
    const organization = await Organization.findByIdAndUpdate(
      authUser.organizationId,
      {
        $set: {
          logo: logoUrl,
          "settings.logoUrl": logoUrl,
        },
      },
      { new: true },
    ).lean();

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, logoUrl });
  } catch (error) {
    console.error("Upload organization logo error:", error);
    return NextResponse.json(
      { error: "Failed to upload logo." },
      { status: 500 },
    );
  }
}
