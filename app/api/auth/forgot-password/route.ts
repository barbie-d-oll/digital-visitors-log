import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { connectToDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";
import { sendEmail, passwordResetEmail } from "@/lib/notifications/email";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  try {
    await connectToDB();

    const { email } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        ok: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id.toString(), purpose: "password-reset" } as object,
      JWT_SECRET as jwt.Secret,
      { expiresIn: "1h" } as jwt.SignOptions
    );

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

    const { subject, html } = passwordResetEmail({
      userName: user.name,
      resetUrl,
    });

    await sendEmail({ to: user.email, subject, html });

    return NextResponse.json({
      ok: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
