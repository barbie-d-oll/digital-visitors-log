import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import { getDepartmentHeadContext } from "@/lib/auth/department-head";
import { logEvent } from "@/lib/audit";
import Staff from "@/lib/models/staff.model";
import Visitor from "@/lib/models/visitor.model";
import { notifyVisitorAssignment } from "@/lib/notifications/visitor-assignment";

type AssignPayload = {
  staffId?: string;
};

type VisitorRecord = Record<string, unknown> & {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  purpose?: string;
  visitorCode?: string;
  status?: string;
  departmentName?: string;
  assignmentStatus?: string;
  assignedStaffName?: string;
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Visitor not found." },
        { status: 404 },
      );
    }

    const payload = (await request.json()) as AssignPayload;
    const staffId = payload.staffId?.trim();

    if (!staffId || !mongoose.isValidObjectId(staffId)) {
      return NextResponse.json(
        { error: "Please choose a valid staff member." },
        { status: 400 },
      );
    }

    await connectToDB();

    const headContext = await getDepartmentHeadContext(authUser);
    if (!headContext) {
      return NextResponse.json(
        { error: "Only department heads can assign department visitors." },
        { status: 403 },
      );
    }

    const visitor = (await Visitor.findOne({
      _id: id,
      organizationId: authUser.organizationId,
      visitTargetType: "department",
    })
      .select(
        "_id name email phone company purpose visitorCode status departmentId departmentName assignmentStatus assignedStaffId assignedStaffName",
      )
      .lean()) as VisitorRecord | null;

    if (!visitor) {
      return NextResponse.json(
        { error: "Visitor not found." },
        { status: 404 },
      );
    }

    const visitorDepartmentId = getObjectIdString(visitor.departmentId);
    if (!headContext.departmentIdStrings.includes(visitorDepartmentId)) {
      return NextResponse.json(
        { error: "This visitor is outside your department." },
        { status: 403 },
      );
    }

    if (visitor.status !== "Checked In") {
      return NextResponse.json(
        { error: "Only checked-in visitors can be assigned." },
        { status: 400 },
      );
    }

    if (visitor.assignmentStatus === "assigned" || visitor.assignedStaffId) {
      return NextResponse.json(
        {
          error: `${visitor.name || "This visitor"} has already been assigned to ${
            visitor.assignedStaffName || "a staff member"
          }.`,
        },
        { status: 409 },
      );
    }

    const staff = await Staff.findOne({
      _id: staffId,
      organizationId: authUser.organizationId,
      departmentId: visitorDepartmentId,
      status: "active",
    }).select("_id name email phone position departmentId");

    if (!staff) {
      return NextResponse.json(
        { error: "Please choose an active staff member in this department." },
        { status: 400 },
      );
    }

    const assignedAt = new Date();
    const assignedVisitor = (await Visitor.findOneAndUpdate(
      {
        _id: id,
        organizationId: authUser.organizationId,
        visitTargetType: "department",
        departmentId: visitorDepartmentId,
        status: "Checked In",
        assignmentStatus: "pending",
        $or: [
          { assignedStaffId: { $exists: false } },
          { assignedStaffId: null },
        ],
      },
      {
        $set: {
          staff: staff.name,
          staffId: staff._id,
          assignedStaffId: staff._id,
          assignedStaffName: staff.name,
          assignedByHeadId: headContext.staff.objectId,
          assignedByUserId: authUser.userId,
          assignedAt,
          assignmentStatus: "assigned",
          assignmentNotificationStatus: "not_sent",
        },
        $unset: {
          assignmentNotificationError: "",
        },
      },
      { new: true, runValidators: true },
    ).lean()) as VisitorRecord | null;

    if (!assignedVisitor) {
      const latestVisitor = await Visitor.findById(id)
        .select("name assignedStaffName assignmentStatus")
        .lean();

      return NextResponse.json(
        {
          error: `${latestVisitor?.name || "This visitor"} has already been assigned to ${
            latestVisitor?.assignedStaffName || "a staff member"
          }.`,
        },
        { status: 409 },
      );
    }

    const notificationResult = await notifyVisitorAssignment({
      visitorName: assignedVisitor.name || visitor.name || "Visitor",
      visitorEmail: assignedVisitor.email || visitor.email,
      visitorPhone: assignedVisitor.phone || visitor.phone,
      staffName: staff.name,
      departmentName: assignedVisitor.departmentName || visitor.departmentName,
      organizationId: authUser.organizationId,
    });

    const notificationUpdate: Record<string, unknown> = {
      assignmentNotificationStatus: notificationResult.status,
    };

    if (notificationResult.status === "sent") {
      notificationUpdate.assignmentNotificationSentAt = new Date();
    }

    if (notificationResult.error) {
      notificationUpdate.assignmentNotificationError = notificationResult.error;
    }

    await Visitor.updateOne(
      { _id: id },
      { $set: notificationUpdate },
    );

    logEvent({
      action: "visitor.department_assigned",
      entity: "visitor",
      entityId: getObjectIdString(assignedVisitor._id),
      userId: authUser.userId,
      userName: headContext.staff.name,
      organizationId: authUser.organizationId,
      details: {
        visitorName: assignedVisitor.name,
        visitorCode: assignedVisitor.visitorCode,
        departmentId: visitorDepartmentId,
        departmentName: assignedVisitor.departmentName || visitor.departmentName,
        assignedStaffId: staff._id.toString(),
        assignedStaffName: staff.name,
        notificationStatus: notificationResult.status,
      },
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      visitor: {
        id: getObjectIdString(assignedVisitor._id),
        name: assignedVisitor.name || "",
        departmentId: visitorDepartmentId,
        departmentName: assignedVisitor.departmentName || visitor.departmentName || "",
        assignmentStatus: "assigned",
        assignedStaffId: staff._id.toString(),
        assignedStaffName: staff.name,
        assignedAt,
        assignmentNotificationStatus: notificationResult.status,
        assignmentNotificationError: notificationResult.error,
      },
    });
  } catch (error) {
    console.error("Assign department visitor error:", error);
    return NextResponse.json(
      { error: "Failed to assign staff member." },
      { status: 500 },
    );
  }
}
