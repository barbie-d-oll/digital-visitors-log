import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import {
  clearRefreshTokenCookie,
  clearTokenCookie,
  getRefreshTokenFromCookies,
  setRefreshTokenCookie,
  setTokenCookie,
  signRefreshToken,
  signToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";
import type { JwtPayload } from "@/lib/auth/jwt";
import { getIsDepartmentHead } from "@/lib/auth/department-head";
import User from "@/lib/models/user.model";
import Organization from "@/lib/models/organization.model";

function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

function clearSessionCookies(response: NextResponse) {
  response.cookies.set(clearTokenCookie());
  response.cookies.set(clearRefreshTokenCookie());
}

function setSessionCookies(response: NextResponse, payload: JwtPayload) {
  response.cookies.set(setTokenCookie(signToken(payload)));
  response.cookies.set(setRefreshTokenCookie(signRefreshToken(payload)));
}

async function getFreshSession(refreshToken: string | null) {
  if (!refreshToken) {
    return null;
  }

  const currentPayload = verifyRefreshToken(refreshToken);
  if (!currentPayload) {
    return null;
  }

  await connectToDB();

  const user = await User.findById(currentPayload.userId);
  if (!user || user.status !== "active") {
    return null;
  }

  const organization = await Organization.findById(user.organizationId);
  if (!organization || organization.status !== "active") {
    return null;
  }

  const userId = String(user._id);
  const organizationId = String(organization._id);
  const tokenPayload: JwtPayload = {
    userId,
    email: user.email,
    role: user.role,
    organizationId,
    organizationName: organization.name,
  };
  const isDepartmentHead = await getIsDepartmentHead(tokenPayload);

  return {
    tokenPayload,
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      organizationId,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      organizationLogoUrl:
        organization.logo || organization.settings?.logoUrl || "",
      primaryColor: organization.settings?.primaryColor || "#1b6b61",
      customBranding: organization.settings?.customBranding || false,
      plan: organization.plan,
      isDepartmentHead,
    },
  };
}

export async function POST() {
  try {
    const refreshToken = await getRefreshTokenFromCookies();
    const session = await getFreshSession(refreshToken);

    if (!session) {
      const response = NextResponse.json(
        { error: "Session expired. Please log in again." },
        { status: 401 }
      );
      clearSessionCookies(response);
      return response;
    }

    const response = NextResponse.json({ ok: true, user: session.user });
    setSessionCookies(response, session.tokenPayload);
    return response;
  } catch (error) {
    console.error("Refresh session error:", error);
    return NextResponse.json(
      { error: "Failed to refresh session." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const redirectPath = getSafeRedirectPath(
    request.nextUrl.searchParams.get("redirect")
  );

  try {
    const refreshToken = await getRefreshTokenFromCookies();
    const session = await getFreshSession(refreshToken);

    if (!session) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", redirectPath);

      const response = NextResponse.redirect(loginUrl);
      clearSessionCookies(response);
      return response;
    }

    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    setSessionCookies(response, session.tokenPayload);
    return response;
  } catch (error) {
    console.error("Refresh session redirect error:", error);

    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", redirectPath);

    const response = NextResponse.redirect(loginUrl);
    clearSessionCookies(response);
    return response;
  }
}
