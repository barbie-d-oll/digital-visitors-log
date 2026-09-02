import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import {
  ensureStaffLoginAccess,
  summarizeStaffLoginProvision,
  type StaffLoginProvisionResult,
} from "@/lib/auth/staff-login";
import Department from "@/lib/models/department.model";
import Staff from "@/lib/models/staff.model";
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

function getDepartmentLoginMessage(
  defaultMessage: string,
  results: StaffLoginProvisionResult[],
) {
  const summary = summarizeStaffLoginProvision(results);

  if (summary.created === 0) {
    return defaultMessage;
  }

  return summary.failed === 0
    ? `${defaultMessage} Department head login details were emailed.`
    : `${defaultMessage} Some department head login emails could not be sent. Please check email settings.`;
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

    const loginResults: StaffLoginProvisionResult[] = [];

    for (const member of headStaff) {
      const employeeEmail = member.email?.toLowerCase();
      if (!employeeEmail) continue;

      const loginAccess = await ensureStaffLoginAccess({
        name: member.name,
        email: employeeEmail,
        organizationId: authUser.organizationId,
        invitedByUserId: authUser.userId,
      });
      loginResults.push(loginAccess);
    }

    return NextResponse.json(
      {
        ok: true,
        department,
        message: getDepartmentLoginMessage(
          "Department added successfully.",
          loginResults,
        ),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create department error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to create department.") },
      { status: 500 }
    );
  }
}
