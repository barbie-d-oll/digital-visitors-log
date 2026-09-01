import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";
import Organization from "@/lib/models/organization.model";
import { comparePassword } from "@/lib/auth/password";
import {
  signRefreshToken,
  signToken,
  setRefreshTokenCookie,
  setTokenCookie,
} from "@/lib/auth/jwt";
import { getIsDepartmentHead } from "@/lib/auth/department-head";
import { logEvent } from "@/lib/audit";

type LoginPayload = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    await connectToDB();

    const body = (await request.json()) as LoginPayload;
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Find user with password field included
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { error: "Your account has been deactivated. Contact your admin." },
        { status: 403 }
      );
    }

    // Get organization
    const organization = await Organization.findById(user.organizationId);
    if (!organization || organization.status !== "active") {
      return NextResponse.json(
        { error: "Your organization is inactive." },
        { status: 403 }
      );
    }

    // Update last login
    await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

    // Generate session tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: organization._id.toString(),
      organizationName: organization.name,
    };
    const token = signToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);
    const isDepartmentHead = await getIsDepartmentHead(tokenPayload);

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: organization._id,
        organizationName: organization.name,
        organizationSlug: organization.slug,
        organizationLogoUrl:
          organization.logo || organization.settings?.logoUrl || "",
        plan: organization.plan,
        avatar: user.avatar,
        isDepartmentHead,
      },
    });

    response.cookies.set(setTokenCookie(token));
    response.cookies.set(setRefreshTokenCookie(refreshToken));

    // Audit log
    logEvent({
      action: "user.login",
      entity: "user",
      entityId: user._id.toString(),
      userId: user._id.toString(),
      userName: user.name,
      organizationId: organization._id.toString(),
    }).catch(() => {});

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
