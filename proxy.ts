import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  verifyToken,
} from "@/lib/auth/jwt";
import type { JwtPayload } from "@/lib/auth/jwt";

const protectedPaths = ["/dashboard"];
const authPaths = ["/auth/login", "/auth/register"];

function attachAuthHeaders(request: NextRequest, payload: JwtPayload) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-email", payload.email);
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-organization-id", payload.organizationId);
  requestHeaders.set("x-organization-name", payload.organizationName);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}

function getCurrentPath(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  return `${pathname}${search}`;
}

function getRefreshUrl(request: NextRequest, redirectPath: string) {
  const refreshUrl = new URL("/api/auth/refresh", request.url);
  refreshUrl.searchParams.set("redirect", redirectPath);
  return refreshUrl;
}

function redirectToLogin(request: NextRequest, redirectPath: string) {
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("redirect", redirectPath);

  const response = NextResponse.redirect(loginUrl);
  clearAuthCookies(response);
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    const payload = token ? verifyToken(token) : null;
    const currentPath = getCurrentPath(request);

    if (payload) {
      return attachAuthHeaders(request, payload);
    }

    if (refreshToken) {
      return NextResponse.redirect(getRefreshUrl(request, currentPath));
    }

    return redirectToLogin(request, currentPath);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage) {
    const payload = token ? verifyToken(token) : null;

    if (payload) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (refreshToken) {
      return NextResponse.redirect(getRefreshUrl(request, "/dashboard"));
    }

    if (token) {
      const response = NextResponse.next();
      clearAuthCookies(response);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
