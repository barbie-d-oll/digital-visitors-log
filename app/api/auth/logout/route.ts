import { NextResponse } from "next/server";

import { clearRefreshTokenCookie, clearTokenCookie } from "@/lib/auth/jwt";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(clearTokenCookie());
  response.cookies.set(clearRefreshTokenCookie());
  return response;
}
