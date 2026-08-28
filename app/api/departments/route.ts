import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Department from "@/lib/models/department.model";
import { getErrorMessage } from "@/lib/utils";

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

    const body = await request.json();
    const { name, description, headId } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Department name is required." },
        { status: 400 }
      );
    }

    // Check for duplicate within org
    const existing = await Department.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
      organizationId: authUser.organizationId,
    });

    if (existing) {
      return NextResponse.json(
        { error: "A department with this name already exists." },
        { status: 409 }
      );
    }

    const department = await Department.create({
      name: name.trim(),
      description: description?.trim() || "",
      headId: headId || undefined,
      organizationId: authUser.organizationId,
    });

    return NextResponse.json({ ok: true, department }, { status: 201 });
  } catch (error) {
    console.error("Create department error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to create department.") },
      { status: 500 }
    );
  }
}
