import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { connectToDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";
import { hashPassword } from "@/lib/auth/password";
import { logEvent } from "@/lib/audit";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  try {
    await connectToDB();

    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Verify token
    let decoded: { userId: string; purpose: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as { userId: string; purpose: string };
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    if (decoded.purpose !== "password-reset") {
      return NextResponse.json(
        { error: "Invalid token." },
        { status: 400 }
      );
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Update password
    const hashedPassword = await hashPassword(password);
    await User.updateOne({ _id: user._id }, { password: hashedPassword });

    // Audit log
    logEvent({
      action: "user.password_reset",
      entity: "user",
      entityId: user._id.toString(),
      userId: user._id.toString(),
      userName: user.name,
      organizationId: user.organizationId.toString(),
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      message: "Password has been reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
