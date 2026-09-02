import { NextRequest, NextResponse } from "next/server";

import { getIsDepartmentHead } from "@/lib/auth/department-head";
import { getAuthUser } from "@/lib/auth/jwt";
import { connectToDB } from "@/lib/db/mongoose";
import Organization from "@/lib/models/organization.model";
import Staff from "@/lib/models/staff.model";
import User from "@/lib/models/user.model";

function normalizeAvatarUrl(value: string) {
  const avatarUrl = value.trim();

  if (!avatarUrl) {
    return "";
  }

  if (avatarUrl.startsWith("/") && !avatarUrl.startsWith("//")) {
    return avatarUrl;
  }

  try {
    const parsedUrl = new URL(avatarUrl);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return avatarUrl;
    }
  } catch {
    return null;
  }

  return null;
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const avatar =
      typeof body.avatar === "string"
        ? normalizeAvatarUrl(body.avatar)
        : undefined;

    if (!name) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 },
      );
    }

    if (avatar === null) {
      return NextResponse.json(
        { error: "Avatar must be a valid http, https, or local image path." },
        { status: 400 },
      );
    }

    const updates: Record<string, string> = { name };
    if (avatar !== undefined) {
      updates.avatar = avatar;
    }

    const user = await User.findOneAndUpdate(
      { _id: authUser.userId, organizationId: authUser.organizationId },
      { $set: updates },
      { new: true },
    );

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await Staff.updateOne(
      { email: user.email, organizationId: user.organizationId },
      { $set: { name } },
    );

    const organization = await Organization.findById(user.organizationId);
    const isDepartmentHead = await getIsDepartmentHead(authUser);

    return NextResponse.json({
      ok: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        organizationId: user.organizationId,
        organizationName: organization?.name ?? "",
        organizationSlug: organization?.slug ?? "",
        organizationLogoUrl:
          organization?.logo || organization?.settings?.logoUrl || "",
        plan: organization?.plan ?? "free",
        isDepartmentHead,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 },
    );
  }
}
