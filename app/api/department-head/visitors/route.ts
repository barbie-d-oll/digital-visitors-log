import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import { getDepartmentHeadContext } from "@/lib/auth/department-head";
import Staff from "@/lib/models/staff.model";
import Visitor from "@/lib/models/visitor.model";

type PopulatedName = {
  _id?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  position?: unknown;
};

type VisitorRecord = Record<string, unknown> & {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  purpose?: string;
  staff?: string;
  visitorCode?: string;
  status?: string;
  checkIn?: Date | string;
  assignmentStatus?: string;
  assignedStaffName?: string;
  assignedAt?: Date | string;
  departmentName?: string;
};

type StaffRecord = Record<string, unknown> & {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
};

function getObjectIdString(value: unknown) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === "object" && "_id" in value) {
    return getObjectIdString((value as { _id?: unknown })._id);
  }

  const valueWithToString = value as { toString?: () => string };
  if (typeof valueWithToString.toString === "function") {
    return valueWithToString.toString();
  }

  return "";
}

function getPopulatedName(value: unknown, fallback?: string) {
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as PopulatedName).name;
    return typeof name === "string" ? name : fallback || "";
  }

  return fallback || "";
}

function serializeStaff(member: StaffRecord) {
  const departmentId = getObjectIdString(member.departmentId);

  return {
    id: getObjectIdString(member._id),
    name: member.name || "",
    email: member.email || "",
    phone: member.phone || "",
    position: member.position || "",
    departmentId,
  };
}

function serializeVisitor(visitor: VisitorRecord) {
  const departmentName = getPopulatedName(
    visitor.departmentId,
    visitor.departmentName,
  );
  const assignedStaff =
    visitor.assignedStaffId &&
    typeof visitor.assignedStaffId === "object" &&
    "name" in visitor.assignedStaffId
      ? (visitor.assignedStaffId as PopulatedName)
      : null;
  const assignedBy =
    visitor.assignedByHeadId &&
    typeof visitor.assignedByHeadId === "object" &&
    "name" in visitor.assignedByHeadId
      ? (visitor.assignedByHeadId as PopulatedName)
      : null;

  return {
    id: getObjectIdString(visitor._id),
    name: visitor.name || "",
    email: visitor.email || "",
    phone: visitor.phone || "",
    company: visitor.company || "",
    purpose: visitor.purpose || "",
    visitorCode: visitor.visitorCode || "",
    status: visitor.status || "",
    checkIn: visitor.checkIn,
    staff: visitor.staff || "",
    departmentId: getObjectIdString(visitor.departmentId),
    departmentName,
    assignmentStatus: visitor.assignmentStatus || "pending",
    assignedStaffId: getObjectIdString(visitor.assignedStaffId),
    assignedStaffName:
      (typeof assignedStaff?.name === "string"
        ? assignedStaff.name
        : visitor.assignedStaffName) || "",
    assignedStaffEmail:
      typeof assignedStaff?.email === "string" ? assignedStaff.email : "",
    assignedStaffPhone:
      typeof assignedStaff?.phone === "string" ? assignedStaff.phone : "",
    assignedAt: visitor.assignedAt,
    assignedByHeadId: getObjectIdString(visitor.assignedByHeadId),
    assignedByHeadName:
      typeof assignedBy?.name === "string" ? assignedBy.name : "",
    assignmentNotificationStatus:
      typeof visitor.assignmentNotificationStatus === "string"
        ? visitor.assignmentNotificationStatus
        : "not_sent",
  };
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const headContext = await getDepartmentHeadContext(authUser);
    if (!headContext) {
      return NextResponse.json(
        { error: "Only department heads can view this page." },
        { status: 403 },
      );
    }

    const assignmentStatus =
      request.nextUrl.searchParams.get("assignmentStatus") || "pending";
    const visitorQuery: Record<string, unknown> = {
      organizationId: authUser.organizationId,
      visitTargetType: "department",
      departmentId: { $in: headContext.departmentIds },
      status: "Checked In",
    };

    if (assignmentStatus === "assigned") {
      visitorQuery.assignmentStatus = "assigned";
    } else if (assignmentStatus !== "all") {
      visitorQuery.assignmentStatus = "pending";
    }

    const [visitors, staff] = await Promise.all([
      Visitor.find(visitorQuery)
        .populate("departmentId", "name")
        .populate("assignedStaffId", "name email phone position")
        .populate("assignedByHeadId", "name email")
        .sort({ assignmentStatus: 1, checkIn: -1 })
        .lean(),
      Staff.find({
        organizationId: authUser.organizationId,
        departmentId: { $in: headContext.departmentIds },
        status: "active",
      })
        .select("_id name email phone position departmentId")
        .sort({ name: 1 })
        .lean(),
    ]);

    return NextResponse.json({
      ok: true,
      departmentHead: {
        id: headContext.staff.id,
        name: headContext.staff.name,
        email: headContext.staff.email,
      },
      departments: headContext.departments.map((department) => ({
        id: department.id,
        name: department.name,
      })),
      staff: (staff as unknown as StaffRecord[]).map(serializeStaff),
      visitors: (visitors as unknown as VisitorRecord[]).map(serializeVisitor),
    });
  } catch (error) {
    console.error("Department-head visitors error:", error);
    return NextResponse.json(
      { error: "Failed to fetch department visitors." },
      { status: 500 },
    );
  }
}
