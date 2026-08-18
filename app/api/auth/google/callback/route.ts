import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getGoogleTokens, getGoogleUser } from "@/lib/auth/google";
import { signToken, setTokenCookie } from "@/lib/auth/jwt";
import User from "@/lib/models/user.model";
import Organization from "@/lib/models/organization.model";
import Membership from "@/lib/models/membership.model";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(
        new URL("/auth/login?error=no_code", request.url)
      );
    }

    const tokens = await getGoogleTokens(code);
    const googleUser = await getGoogleUser(tokens.access_token);

    await connectToDB();

    // Check if user exists with this Google ID or email
    let user = await User.findOne({
      $or: [
        { googleId: googleUser.id },
        { email: googleUser.email.toLowerCase() },
      ],
    });

    let isNewUser = false;

    if (user) {
      // Update Google ID if they previously registered with email/password
      if (!user.googleId) {
        user.googleId = googleUser.id;
        user.authProvider = "google";
        if (googleUser.picture) user.avatar = googleUser.picture;
        await user.save();
      }

      user.lastLogin = new Date();
      await user.save();
    } else {
      // New Google user — create org + user
      isNewUser = true;
      const slug = `${googleUser.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;

      const organization = await Organization.create({
        name: `${googleUser.name}'s Organization`,
        slug,
        email: googleUser.email.toLowerCase(),
      });

      user = await User.create({
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.id,
        avatar: googleUser.picture,
        role: "owner",
        organizationId: organization._id,
        authProvider: "google",
        lastLogin: new Date(),
      });

      // Create membership record
      await Membership.create({
        userId: user._id,
        organizationId: organization._id,
        role: "owner",
        status: "active",
        joinedAt: new Date(),
      });
    }

    const organization = await Organization.findById(user.organizationId);

    if (!organization || organization.status !== "active") {
      return NextResponse.redirect(
        new URL("/auth/login?error=org_inactive", request.url)
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: organization._id.toString(),
      organizationName: organization.name,
    });

    const response = NextResponse.redirect(
      new URL(isNewUser ? "/onboarding" : "/dashboard", request.url)
    );
    response.cookies.set(setTokenCookie(token));

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_failed", request.url)
    );
  }
}
