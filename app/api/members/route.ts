import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Membership from "@/lib/models/membership.model";
import User from "@/lib/models/user.model";
import { sendEmail, memberInviteEmail } from "@/lib/notifications/email";
import Organization from "@/lib/models/organization.model";

/**
 * GET - List all members of the current organization.
 * POST - Invite a new member to the organization.
 */
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const memberships = await Membership.find({
      organizationId: authUser.organizationId,
    })
      .populate("userId", "name email avatar")
      .sort({ createdAt: 1 })
      .lean();

    const members = memberships.map((m) => {
      const populatedUser = m.userId as unknown as { _id: string; name: string; email: string; avatar?: string } | null;
      return {
        id: m._id,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
        user: populatedUser,
      };
    });

    return NextResponse.json({ ok: true, members });
  } catch (error) {
    console.error("Get members error:", error);
    return NextResponse.json(
      { error: "Failed to fetch members." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (authUser.role === "staff") {
      return NextResponse.json(
        { error: "Only owners and admins can invite members." },
        { status: 403 }
      );
    }

    await connectToDB();

    const body = await request.json();
    const { email, role } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const validRoles = ["admin", "staff"];
    const memberRole = validRoles.includes(role) ? role : "admin";

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      // Check if already a member
      const existingMembership = await Membership.findOne({
        userId: existingUser._id,
        organizationId: authUser.organizationId,
      });

      if (existingMembership) {
        return NextResponse.json(
          { error: "This user is already a member of your organization." },
          { status: 409 }
        );
      }

      // Add membership
      await Membership.create({
        userId: existingUser._id,
        organizationId: authUser.organizationId,
        role: memberRole,
        status: "active",
        invitedBy: authUser.userId,
        joinedAt: new Date(),
      });
    } else {
      // User doesn't exist yet — we'll just send the invite email.
      // When they register, they can be linked to the org via the invite flow.
    }

    // Send invite email
    const org = await Organization.findById(authUser.organizationId);
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register?invite=${authUser.organizationId}`;

    const { subject, html } = memberInviteEmail({
      organizationName: org?.name || "an organization",
      role: memberRole,
      inviteUrl,
    });

    sendEmail({ to: email.toLowerCase(), subject, html }).catch((err) =>
      console.error("Invite email failed:", err)
    );

    return NextResponse.json(
      { ok: true, message: `Invitation sent to ${email}.` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Invite member error:", error);
    return NextResponse.json(
      { error: "Failed to invite member." },
      { status: 500 }
    );
  }
}
