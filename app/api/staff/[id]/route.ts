import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Staff from "@/lib/models/staff.model";
import { getErrorMessage } from "@/lib/utils";

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
      return NextResponse.json({ error: "Staff not found." }, { status: 404 });
    }

    const member = await Staff.findOne({
      _id: id,
      organizationId: authUser.organizationId,
    })
      .populate("departmentId", "name")
      .lean();

    if (!member) {
      return NextResponse.json({ error: "Staff not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, staff: member });
  } catch (error) {
    console.error("Get staff error:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff member." },
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
      return NextResponse.json({ error: "Staff not found." }, { status: 404 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const position =
      typeof body.position === "string" ? body.position.trim() : "";
    const departmentId =
      typeof body.departmentId === "string" ? body.departmentId.trim() : "";
    const status = body.status === "inactive" ? "inactive" : "active";

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    if (departmentId && !mongoose.isValidObjectId(departmentId)) {
      return NextResponse.json(
        { error: "Please choose a valid department." },
        { status: 400 }
      );
    }

    const existing = await Staff.findOne({
      _id: { $ne: id },
      email,
      organizationId: authUser.organizationId,
    });

    if (existing) {
      return NextResponse.json(
        { error: "A staff member with this email already exists." },
        { status: 409 }
      );
    }

    const update: {
      $set: Record<string, unknown>;
      $unset?: Record<string, string>;
    } = {
      $set: {
        name,
        email,
        phone,
        position,
        status,
      },
    };

    if (departmentId) {
      update.$set.departmentId = departmentId;
    } else {
      update.$unset = { departmentId: "" };
    }

    const member = await Staff.findOneAndUpdate(
      { _id: id, organizationId: authUser.organizationId },
      update,
      { returnDocument: "after", runValidators: true }
    )
      .populate("departmentId", "name")
      .lean();

    if (!member) {
      return NextResponse.json({ error: "Staff not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, staff: member });
  } catch (error) {
    console.error("Update staff error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to update staff member.") },
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
      return NextResponse.json({ error: "Staff not found." }, { status: 404 });
    }

    const member = await Staff.findOneAndDelete({
      _id: id,
      organizationId: authUser.organizationId,
    });

    if (!member) {
      return NextResponse.json({ error: "Staff not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Staff member deleted." });
  } catch (error) {
    console.error("Delete staff error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to delete staff member.") },
      { status: 500 }
    );
  }
}
