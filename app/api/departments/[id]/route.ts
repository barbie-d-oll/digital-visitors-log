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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Department not found." },
        { status: 404 }
      );
    }

    const department = await Department.findOne({
      _id: id,
      organizationId: authUser.organizationId,
    })
      .populate("headIds", "name email phone")
      .populate("headId", "name email phone")
      .lean();

    if (!department) {
      return NextResponse.json(
        { error: "Department not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, department });
  } catch (error) {
    console.error("Get department error:", error);
    return NextResponse.json(
      { error: "Failed to fetch department." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Department not found." },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const headIds = getRequestedHeadIds(body);
    const status = body.status === "inactive" ? "inactive" : "active";

    if (!name) {
      return NextResponse.json(
        { error: "Department name is required." },
        { status: 400 }
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

    const existing = await Department.findOne({
      _id: { $ne: id },
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
      organizationId: authUser.organizationId,
    });

    if (existing) {
      return NextResponse.json(
        { error: "A department with this name already exists." },
        { status: 409 }
      );
    }

    const update: {
      $set: Record<string, unknown>;
      $unset?: Record<string, string>;
    } = {
      $set: {
        name,
        description,
        status,
      },
    };

    update.$set.headIds = headIds;

    if (headIds.length > 0) {
      update.$set.headId = headIds[0];
    } else {
      update.$unset = { headId: "" };
    }

    const department = await Department.findOneAndUpdate(
      { _id: id, organizationId: authUser.organizationId },
      update,
      { returnDocument: "after", runValidators: true }
    )
      .populate("headIds", "name email phone")
      .populate("headId", "name email phone")
      .lean();

    if (!department) {
      return NextResponse.json(
        { error: "Department not found." },
        { status: 404 }
      );
    }

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

    return NextResponse.json({
      ok: true,
      department,
      message: getDepartmentLoginMessage(
        "Department profile updated successfully.",
        loginResults,
      ),
    });
  } catch (error) {
    console.error("Update department error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to update department.") },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Department not found." },
        { status: 404 }
      );
    }

    const department = await Department.findOneAndDelete({
      _id: id,
      organizationId: authUser.organizationId,
    });

    if (!department) {
      return NextResponse.json(
        { error: "Department not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: "Department deleted." });
  } catch (error) {
    console.error("Delete department error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to delete department.") },
      { status: 500 }
    );
  }
}
