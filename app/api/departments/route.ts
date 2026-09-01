import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import { generateTemporaryPassword, hashPassword } from "@/lib/auth/password";
import Department from "@/lib/models/department.model";
import Membership from "@/lib/models/membership.model";
import Organization from "@/lib/models/organization.model";
import Staff from "@/lib/models/staff.model";
import User from "@/lib/models/user.model";
import { sendEmail, staffWelcomeEmail } from "@/lib/notifications/email";
import { getErrorMessage } from "@/lib/utils";

const MAX_DEPARTMENT_HEADS = 2;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getRequestedHeadIds(body: Record<string, unknown>) {
  const rawHeadIds = Array.isArray(body.headIds)
    ? body.headIds
    : typeof body.headId === "string"
      ? [body.headId]
      : [];

  return Array.from(
    new Set(
      rawHeadIds
        .filter((headId): headId is string => typeof headId === "string")
        .map((headId) => headId.trim())
        .filter(Boolean),
    ),
  );
}

async function validateDepartmentHeadIds(
  headIds: string[],
  organizationId: string,
) {
  if (headIds.length > MAX_DEPARTMENT_HEADS) {
    return "Please choose no more than 2 department heads.";
  }

  if (headIds.some((headId) => !headId || !mongoose.isValidObjectId(headId))) {
    return "Please choose valid department heads.";
  }

  if (headIds.length === 0) {
    return null;
  }

  const staffCount = await Staff.countDocuments({
    _id: { $in: headIds },
    organizationId,
    status: "active",
  });

  return staffCount === headIds.length
    ? null
    : "Please choose active staff members from your organization.";
}

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const departments = await Department.find({
      organizationId: authUser.organizationId,
    })
      .populate("headIds", "name email phone")
      .populate("headId", "name email phone")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ ok: true, departments });
  } catch (error) {
    console.error("Get departments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments." },
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

    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const headIds = getRequestedHeadIds(body);

    if (!name) {
      return NextResponse.json(
        { error: "Department name is required." },
        { status: 400 }
      );
    }

    // Check for duplicate within org
    const existing = await Department.findOne({
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
      organizationId: authUser.organizationId,
    });

    if (existing) {
      return NextResponse.json(
        { error: "A department with this name already exists." },
        { status: 409 }
      );
    }

    const headValidationError = await validateDepartmentHeadIds(
      headIds,
      authUser.organizationId,
    );

    if (headValidationError) {
      return NextResponse.json(
        { error: headValidationError },
        { status: 400 }
      );
    }

    const department = await Department.create({
      name,
      description,
      headId: headIds[0] || undefined,
      headIds,
      organizationId: authUser.organizationId,
    });

    const headStaff = await Staff.find({
      _id: { $in: headIds },
      organizationId: authUser.organizationId,
    }).lean();

    for (const member of headStaff) {
      const employeeEmail = member.email?.toLowerCase();
      if (!employeeEmail) continue;

      let user = await User.findOne({
        email: employeeEmail,
        organizationId: authUser.organizationId,
      });

      let temporaryPassword: string | null = null;

      if (!user) {
        temporaryPassword = generateTemporaryPassword();
        user = await User.create({
          name: member.name,
          email: employeeEmail,
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
          user.status = "active";
          user.role = "staff";
          await user.save();
        }
      }

      if (temporaryPassword) {
        const organization = await Organization.findById(authUser.organizationId);
        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login`;

        const { subject, html } = staffWelcomeEmail({
          userName: member.name,
          organizationName: organization?.name || "your organization",
          email: employeeEmail,
          password: temporaryPassword,
          loginUrl,
        });

        sendEmail({ to: employeeEmail, subject, html }).catch((err) =>
          console.error("Department head login email failed:", err)
        );
      }
    }

    return NextResponse.json({ ok: true, department }, { status: 201 });
  } catch (error) {
    console.error("Create department error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to create department.") },
      { status: 500 }
    );
  }
}
