import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Staff from "@/lib/models/staff.model";

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
    const body = await request.json();

    const member = await Staff.findOneAndUpdate(
      { _id: id, organizationId: authUser.organizationId },
      { $set: body },
      { new: true }
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
      { error: "Failed to update staff member." },
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
      { error: "Failed to delete staff member." },
      { status: 500 }
    );
  }
}
