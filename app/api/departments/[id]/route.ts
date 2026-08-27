import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Department from "@/lib/models/department.model";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const headId = typeof body.headId === "string" ? body.headId.trim() : "";
    const status = body.status === "inactive" ? "inactive" : "active";

    if (!name) {
      return NextResponse.json(
        { error: "Department name is required." },
        { status: 400 }
      );
    }

    if (headId && !mongoose.isValidObjectId(headId)) {
      return NextResponse.json(
        { error: "Please choose a valid department head." },
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

    if (headId) {
      update.$set.headId = headId;
    } else {
      update.$unset = { headId: "" };
    }

    const department = await Department.findOneAndUpdate(
      { _id: id, organizationId: authUser.organizationId },
      update,
      { returnDocument: "after", runValidators: true }
    )
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
    console.error("Update department error:", error);
    return NextResponse.json(
      { error: "Failed to update department." },
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
      { error: "Failed to delete department." },
      { status: 500 }
    );
  }
}
