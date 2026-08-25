import { NextRequest, NextResponse } from "next/server";

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
        .select("name")
        .sort({ name: 1 })
        .lean(),
    ]);

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
      departments: departments.map((d) => ({
        id: d._id,
        name: d.name,
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
