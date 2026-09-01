import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import {
  getAuthUser,
  signRefreshToken,
  signToken,
  setRefreshTokenCookie,
  setTokenCookie,
} from "@/lib/auth/jwt";
import Membership from "@/lib/models/membership.model";
import Organization from "@/lib/models/organization.model";
import User from "@/lib/models/user.model";

/**
 * Switch the user's active organization.
 * Issues a new JWT with the target organization's ID.
 */
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required." },
        { status: 400 }
      );
    }

    // Verify user has membership to this org
    const membership = await Membership.findOne({
      userId: authUser.userId,
      organizationId,
      status: "active",
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You don't have access to this organization." },
        { status: 403 }
      );
    }

    const organization = await Organization.findById(organizationId);
    if (!organization || organization.status !== "active") {
      return NextResponse.json(
        { error: "Organization is inactive." },
        { status: 403 }
      );
    }

    const user = await User.findById(authUser.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Update user's primary org
    user.organizationId = organization._id;
    user.role = membership.role;
    await user.save();

    // Issue new session tokens with the switched org
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: membership.role,
      organizationId: organization._id.toString(),
      organizationName: organization.name,
    };
    const token = signToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const response = NextResponse.json({
      ok: true,
      organization: {
        id: organization._id,
        name: organization.name,
        slug: organization.slug,
      },
    });

    response.cookies.set(setTokenCookie(token));
    response.cookies.set(setRefreshTokenCookie(refreshToken));

    return response;
  } catch (error) {
    console.error("Switch org error:", error);
    return NextResponse.json(
      { error: "Failed to switch organization." },
      { status: 500 }
    );
  }
}
