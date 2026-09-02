import { NextRequest, NextResponse } from "next/server";

import { getGoogleOAuthUrl } from "@/lib/auth/google";

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }

  return value;
}

export async function GET(request: NextRequest) {
  try {
    const redirect = getSafeRedirect(
      request.nextUrl.searchParams.get("redirect"),
    );
    const url = getGoogleOAuthUrl(redirect);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Google OAuth start error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=google_not_configured", request.url),
    );
  }
}
