const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value || value.startsWith("your-")) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function getGoogleRedirectUri(): string {
  const appUrl = getRequiredEnv("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
  return `${appUrl}${GOOGLE_CALLBACK_PATH}`;
}

export function getGoogleOAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: getRequiredEnv("GOOGLE_CLIENT_ID"),
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    ...(state ? { state } : {}),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export type GoogleTokenResponse = {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
};

export type GoogleUserInfo = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
};

export async function getGoogleTokens(
  code: string
): Promise<GoogleTokenResponse> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: getRequiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  return response.json();
}

export async function getGoogleUser(
  accessToken: string
): Promise<GoogleUserInfo> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return response.json();
}
