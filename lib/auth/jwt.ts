import jwt, { SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
const ACCESS_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

export const ACCESS_TOKEN_COOKIE = "token";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

export type JwtPayload = {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName: string;
};

type TokenClaims = JwtPayload & {
  tokenType?: "access" | "refresh";
};

function getJwtPayload(decoded: unknown): JwtPayload | null {
  if (!decoded || typeof decoded !== "object") {
    return null;
  }

  const claims = decoded as Partial<TokenClaims>;

  if (
    typeof claims.userId !== "string" ||
    typeof claims.email !== "string" ||
    typeof claims.role !== "string" ||
    typeof claims.organizationId !== "string" ||
    typeof claims.organizationName !== "string"
  ) {
    return null;
  }

  return {
    userId: claims.userId,
    email: claims.email,
    role: claims.role,
    organizationId: claims.organizationId,
    organizationName: claims.organizationName,
  };
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as unknown as SignOptions["expiresIn"],
  };
  return jwt.sign(
    { ...payload, tokenType: "access" },
    JWT_SECRET as jwt.Secret,
    options
  );
}

export function signRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN as unknown as SignOptions["expiresIn"],
  };
  return jwt.sign(
    { ...payload, tokenType: "refresh" },
    JWT_SECRET as jwt.Secret,
    options
  );
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret);
    const claims = decoded as Partial<TokenClaims>;

    if (claims.tokenType && claims.tokenType !== "access") {
      return null;
    }

    return getJwtPayload(decoded);
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret);
    const claims = decoded as Partial<TokenClaims>;

    if (claims.tokenType !== "refresh") {
      return null;
    }

    return getJwtPayload(decoded);
  } catch {
    return null;
  }
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE);
  return token?.value ?? null;
}

export async function getRefreshTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(REFRESH_TOKEN_COOKIE);
  return token?.value ?? null;
}

export async function getAuthUser(): Promise<JwtPayload | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

export function setTokenCookie(token: string) {
  // Returns cookie options for NextResponse
  return {
    name: ACCESS_TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  };
}

export function setRefreshTokenCookie(token: string) {
  return {
    name: REFRESH_TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  };
}

export function clearTokenCookie() {
  return {
    name: ACCESS_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export function clearRefreshTokenCookie() {
  return {
    name: REFRESH_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
