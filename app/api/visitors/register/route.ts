import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDB } from "@/lib/db/mongoose";
import Visitor from "@/lib/models/visitor.model";
import Organization from "@/lib/models/organization.model";
import Blocklist from "@/lib/models/blocklist.model";
import Department from "@/lib/models/department.model";
import Staff from "@/lib/models/staff.model";
import { notifyHost } from "@/lib/notifications/notify-host";
import { logEvent } from "@/lib/audit";

/**
 * Public visitor registration route.
 * Used by the QR code / public registration page.
 * Checks blocklist, detects returning visitors, notifies host.
 */
export async function POST(request: Request) {
  try {
    await connectToDB();

    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      purpose,
      staff,
      staffId,
      departmentId,
      organizationSlug,
      locationId,
      visitTargetType,
    } = body;
    const normalizedVisitTargetType =
      visitTargetType === "department" ? "department" : "individual";
    const normalizedEmail =
      typeof email === "string" && email.trim()
        ? email.trim().toLowerCase()
        : undefined;
    const normalizedStaffId =
      typeof staffId === "string" && staffId.trim() ? staffId.trim() : undefined;
    const normalizedDepartmentId =
      typeof departmentId === "string" && departmentId.trim()
        ? departmentId.trim()
        : undefined;

    if (!name?.trim() || !phone?.trim() || !purpose?.trim() || !staff?.trim()) {
      return NextResponse.json(
        { error: "Name, phone, purpose, and staff are required." },
        { status: 400 }
      );
    }

    if (!organizationSlug?.trim()) {
      return NextResponse.json(
        { error: "Organization is required." },
        { status: 400 }
      );
    }

    const organization = await Organization.findOne({
      slug: organizationSlug.trim().toLowerCase(),
      status: "active",
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found." },
        { status: 404 }
      );
    }

    // --- Blocklist Check ---
    const blockEntry = await Blocklist.findOne({
      organizationId: organization._id,
      status: "active",
      type: "blocked",
      $or: [
        { name: { $regex: new RegExp(`^${name.trim()}$`, "i") } },
        { phone: phone.trim() },
      ],
    });

    if (blockEntry) {
      return NextResponse.json(
        { error: "We're unable to complete your check-in. Please speak to the front desk." },
        { status: 403 }
      );
    }

    // --- Check if watchlisted (allow but flag) ---
    const watchEntry = await Blocklist.findOne({
      organizationId: organization._id,
      status: "active",
      type: "watchlist",
      $or: [
        { name: { $regex: new RegExp(`^${name.trim()}$`, "i") } },
        { phone: phone.trim() },
      ],
    });

    // --- Detect returning visitor ---
    const previousVisit = await Visitor.findOne({
      phone: phone.trim(),
      organizationId: organization._id,
    }).select("_id").lean();

    const isReturning = !!previousVisit;

    const selectedDepartment =
      normalizedVisitTargetType === "department"
        ? await findSelectedDepartment({
            departmentId: normalizedDepartmentId,
            departmentName: staff.trim(),
            organizationId: organization._id.toString(),
          })
        : null;

    if (normalizedVisitTargetType === "department" && !selectedDepartment) {
      return NextResponse.json(
        { error: "Please choose a valid department." },
        { status: 400 }
      );
    }

    if (
      selectedDepartment &&
      !(await departmentHasActiveHead({
        department: selectedDepartment,
        organizationId: organization._id.toString(),
      }))
    ) {
      return NextResponse.json(
        { error: "This department is not accepting visitor assignments yet." },
        { status: 400 }
      );
    }

    // --- Generate visitor code ---
    const visitorCode = generateVisitorCode(name);
    const staffDisplayName =
      normalizedVisitTargetType === "department"
        ? selectedDepartment?.name || staff.trim()
        : staff.trim();

    // --- Create visitor record ---
    const visitor = await Visitor.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      company: company?.trim() || "",
      purpose: purpose.trim(),
      staff: staffDisplayName,
      staffId:
        normalizedVisitTargetType === "individual" && normalizedStaffId
          ? normalizedStaffId
          : undefined,
      visitTargetType: normalizedVisitTargetType,
      departmentId:
        normalizedVisitTargetType === "department"
          ? selectedDepartment?._id
          : undefined,
      departmentName:
        normalizedVisitTargetType === "department"
          ? selectedDepartment?.name
          : undefined,
      assignmentStatus:
        normalizedVisitTargetType === "department" ? "pending" : "not_required",
      visitorCode,
      organizationId: organization._id,
      locationId: locationId || undefined,
      status: "Checked In",
      checkIn: new Date(),
      isReturning,
    });

    // --- Notify host asynchronously ---
    if (organization.settings?.notifyHostOnArrival !== false) {
      notifyHost({
        visitorName: name.trim(),
        visitorCompany: company?.trim(),
        purpose: purpose.trim(),
        staffName: staffDisplayName,
        staffId: normalizedStaffId,
        departmentId:
          selectedDepartment?._id.toString() || normalizedDepartmentId,
        organizationId: organization._id.toString(),
        checkInTime: new Date(),
        visitTargetType: normalizedVisitTargetType,
      }).catch((err) => console.error("Host notification error:", err));
    }

    // --- Audit log ---
    logEvent({
      action: "visitor.checked_in",
      entity: "visitor",
      entityId: visitor._id.toString(),
      organizationId: organization._id.toString(),
      details: {
        visitorName: name.trim(),
        staff: staffDisplayName,
        staffId: normalizedStaffId,
        departmentId:
          selectedDepartment?._id.toString() || normalizedDepartmentId,
        visitTargetType: normalizedVisitTargetType,
        isReturning,
        watchlisted: !!watchEntry,
      },
    }).catch(() => {});

    return NextResponse.json(
      {
        ok: true,
        visitor: {
          id: visitor._id,
          name: visitor.name,
          visitorCode: visitor.visitorCode,
          checkIn: visitor.checkIn,
          isReturning,
        },
        requiresNda: organization.settings?.requireNda || false,
        watchlisted: !!watchEntry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Public visitor registration error:", error);
    return NextResponse.json(
      { error: "Failed to register visitor." },
      { status: 500 }
    );
  }
}

function generateVisitorCode(name: string): string {
  const letters = name.replace(/[^a-z]/gi, "");
  const first = letters.at(0)?.toUpperCase() ?? "V";
  const last = letters.at(-1)?.toUpperCase() ?? first;
  const randomNumber = String(
    Math.floor(Math.random() * 10000)
  ).padStart(4, "0");
  return `${first}${last}${randomNumber}`;
}

async function findSelectedDepartment({
  departmentId,
  departmentName,
  organizationId,
}: {
  departmentId?: string;
  departmentName: string;
  organizationId: string;
}) {
  if (departmentId && mongoose.isValidObjectId(departmentId)) {
    const department = await Department.findOne({
      _id: departmentId,
      organizationId,
      status: "active",
    }).select("_id name headId headIds");

    if (department) {
      return department;
    }
  }

  return Department.findOne({
    name: {
      $regex: new RegExp(`^${escapeRegex(departmentName.trim())}$`, "i"),
    },
    organizationId,
    status: "active",
  }).select("_id name headId headIds");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getObjectId(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return mongoose.isValidObjectId(value) ? value : null;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === "object" && "_id" in value) {
    return getObjectId((value as { _id?: unknown })._id);
  }

  const valueWithToString = value as { toString?: () => string };
  if (typeof valueWithToString.toString === "function") {
    const id = valueWithToString.toString();
    return mongoose.isValidObjectId(id) ? id : null;
  }

  return null;
}

function getDepartmentHeadIds(department: {
  headId?: unknown;
  headIds?: unknown;
}) {
  const headIds = Array.isArray(department.headIds)
    ? department.headIds.map(getObjectId).filter((id): id is string => Boolean(id))
    : [];
  const fallbackHeadId = getObjectId(department.headId);

  if (headIds.length === 0 && fallbackHeadId) {
    headIds.push(fallbackHeadId);
  }

  return Array.from(new Set(headIds));
}

async function departmentHasActiveHead({
  department,
  organizationId,
}: {
  department: { headId?: unknown; headIds?: unknown };
  organizationId: string;
}) {
  const headIds = getDepartmentHeadIds(department);

  if (headIds.length === 0) {
    return false;
  }

  const activeHeadCount = await Staff.countDocuments({
    _id: { $in: headIds },
    organizationId,
    status: "active",
  });

  return activeHeadCount > 0;
}
