import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import { generateTemporaryPassword, hashPassword } from "@/lib/auth/password";
import Membership from "@/lib/models/membership.model";
import Organization from "@/lib/models/organization.model";
import Staff from "@/lib/models/staff.model";
import User from "@/lib/models/user.model";
import { sendEmail, staffWelcomeEmail } from "@/lib/notifications/email";
import { getErrorMessage } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const departmentId = searchParams.get("departmentId") || "";

    const query: Record<string, unknown> = {
      organizationId: authUser.organizationId,
    };

    if (departmentId) {
      query.departmentId = departmentId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }

    const staff = await Staff.find(query)
      .populate("departmentId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ ok: true, staff });
  } catch (error) {
    console.error("Get staff error:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff." },
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

    await connectToDB();

    const body = await request.json();
    const { name, email, phone, departmentId, position } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for duplicate email within org
    const existing = await Staff.findOne({
      email: normalizedEmail,
      organizationId: authUser.organizationId,
    });

    if (existing) {
      return NextResponse.json(
        { error: "A staff member with this email already exists." },
        { status: 409 }
      );
    }

    let temporaryPassword: string | null = null;

    let user = await User.findOne({
      email: normalizedEmail,
      organizationId: authUser.organizationId,
    });

    if (!user) {
      temporaryPassword = generateTemporaryPassword();
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: await hashPassword(temporaryPassword),
        role: "staff",
        organizationId: authUser.organizationId,
        authProvider: "credentials",
        status: "active",
      });

      await Membership.create({
        userId: user._id,
        organizationId: authUser.organizationId,
        role: "staff",
        status: "active",
        invitedBy: authUser.userId,
        joinedAt: new Date(),
      });
    } else {
      const existingMembership = await Membership.findOne({
        userId: user._id,
        organizationId: authUser.organizationId,
      });

      if (!existingMembership) {
        await Membership.create({
          userId: user._id,
          organizationId: authUser.organizationId,
          role: "staff",
          status: "active",
          invitedBy: authUser.userId,
          joinedAt: new Date(),
        });
      }

      if (!user.password) {
        temporaryPassword = generateTemporaryPassword();
        user.password = await hashPassword(temporaryPassword);
        user.role = "staff";
        user.status = "active";
        await user.save();
      }
    }

    const member = await Staff.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || "",
      departmentId: departmentId || undefined,
      position: position?.trim() || "",
      organizationId: authUser.organizationId,
    });

    if (temporaryPassword) {
      const organization = await Organization.findById(authUser.organizationId);
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login`;

      const { subject, html } = staffWelcomeEmail({
        userName: name.trim(),
        organizationName: organization?.name || "your organization",
        email: normalizedEmail,
        password: temporaryPassword,
        loginUrl,
      });

      sendEmail({ to: normalizedEmail, subject, html }).catch((err) =>
        console.error("Staff login email failed:", err)
      );
    }

    return NextResponse.json(
      {
        ok: true,
        staff: member,
        message: temporaryPassword
          ? "Staff added successfully. Login details were emailed to them."
          : "Staff added successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create staff error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to create staff member.") },
      { status: 500 }
    );
  }
}
