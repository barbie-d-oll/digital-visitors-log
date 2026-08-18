import { NextResponse } from "next/server";

import { getGoogleOAuthUrl } from "@/lib/auth/google";

export async function GET() {
  const url = getGoogleOAuthUrl();
  return NextResponse.redirect(url);
}
