import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import Organization from "@/lib/models/organization.model";
import User from "@/lib/models/user.model";
import Membership from "@/lib/models/membership.model";
import { hashPassword } from "@/lib/auth/password";
import { sendEmail, userWelcomeRegistrationEmail } from "@/lib/notifications/email";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  organizationName: string;
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function POST(request: Request) {
  try {
    await connectToDB();

    const body = (await request.json()) as RegisterPayload;
    const { name, email, password, organizationName } = body;

    if (!name?.trim() || !email?.trim() || !password || !organizationName?.trim()) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Create the organization
    let slug = generateSlug(organizationName);

    // Ensure unique slug
    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const organization = await Organization.create({
      name: organizationName.trim(),
      slug,
      email: email.toLowerCase(),
    });

    // Create the owner user
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "owner",
      organizationId: organization._id,
      authProvider: "credentials",
    });

    // Create membership record
    await Membership.create({
      userId: user._id,
      organizationId: organization._id,
      role: "owner",
      status: "active",
      joinedAt: new Date(),
    });

    // Send welcome email asynchronously
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const welcomeEmail = userWelcomeRegistrationEmail({
      userName: user.name,
      organizationName: organization.name,
      email: user.email,
      loginUrl: `${appUrl}/auth/login`,
    });

    sendEmail({
      to: user.email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
    }).catch((err) => {
      console.error("Failed to send welcome registration email:", err);
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: organization._id,
          organizationName: organization.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
