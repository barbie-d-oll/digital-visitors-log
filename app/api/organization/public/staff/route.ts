import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDB } from "@/lib/db/mongoose";
import Organization from "@/lib/models/organization.model";
import Staff from "@/lib/models/staff.model";
import Department from "@/lib/models/department.model";

/**
 * Public route — returns active staff and departments for an organization.
 * Used by the public registration page so visitors can select who they're visiting.
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const slug = request.nextUrl.searchParams.get("slug");
    const search = request.nextUrl.searchParams.get("search")?.trim() || "";
    if (!slug) {
      return NextResponse.json({ error: "Organization slug is required." }, { status: 400 });
    }

    const org = await Organization.findOne({
      slug: slug.trim().toLowerCase(),
      status: "active",
    }).select("_id");

    if (!org) {
      return NextResponse.json({ error: "Organization not found." }, { status: 404 });
    }

    const shouldSearchStaff = search.length >= 1;
    const staffQuery = {
      organizationId: org._id,
      status: "active" as const,
      ...(shouldSearchStaff
        ? { name: { $regex: escapeRegex(search), $options: "i" as const } }
        : {}),
    };

    const [staff, departments] = await Promise.all([
      shouldSearchStaff
        ? Staff.find(staffQuery)
            .select("name departmentId position")
            .populate("departmentId", "name")
            .sort({ name: 1 })
            .limit(8)
            .lean()
        : Promise.resolve([]),
      Department.find({ organizationId: org._id, status: "active" })
        .select("name headId headIds")
        .sort({ name: 1 })
        .lean(),
    ]);
    const publicDepartments = await filterDepartmentsWithActiveHeads(
      departments as unknown as Array<Record<string, unknown>>,
      org._id.toString(),
    );

    return NextResponse.json({
      ok: true,
      staff: staff.map((s) => ({
        id: s._id,
        name: s.name,
        position: s.position || "",
        department: s.departmentId && typeof s.departmentId === "object" && "name" in s.departmentId
          ? (s.departmentId as unknown as { name: string }).name
          : "",
      })),
      departments: publicDepartments.map((d) => ({
        id: getObjectId(d._id) || "",
        name: typeof d.name === "string" ? d.name : "",
      })),
    });
  } catch (error) {
    console.error("Public staff list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff." },
      { status: 500 }
    );
  }
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

async function filterDepartmentsWithActiveHeads(
  departments: Array<Record<string, unknown>>,
  organizationId: string,
) {
  const headIds = Array.from(
    new Set(departments.flatMap((department) => getDepartmentHeadIds(department))),
  );

  if (headIds.length === 0) {
    return [];
  }

  const activeHeads = await Staff.find({
    _id: { $in: headIds },
    organizationId,
    status: "active",
  })
    .select("_id")
    .lean();
  const activeHeadIds = new Set(
    activeHeads.map((head) => getObjectId(head._id)).filter(Boolean),
  );

  return departments.filter((department) =>
    getDepartmentHeadIds(department).some((headId) => activeHeadIds.has(headId)),
  );
}
