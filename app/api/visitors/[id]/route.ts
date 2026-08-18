import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Visitor from "@/lib/models/visitor.model";

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

    const visitor = await Visitor.findOne({
      _id: id,
      organizationId: authUser.organizationId,
    }).lean();

    if (!visitor) {
      return NextResponse.json({ error: "Visitor not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, visitor });
  } catch (error) {
    console.error("Get visitor error:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitor." },
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

    const visitor = await Visitor.findOneAndUpdate(
      { _id: id, organizationId: authUser.organizationId },
      { $set: body },
      { new: true }
    ).lean();

    if (!visitor) {
      return NextResponse.json({ error: "Visitor not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, visitor });
  } catch (error) {
    console.error("Update visitor error:", error);
    return NextResponse.json(
      { error: "Failed to update visitor." },
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

    const visitor = await Visitor.findOneAndDelete({
      _id: id,
      organizationId: authUser.organizationId,
    });

    if (!visitor) {
      return NextResponse.json({ error: "Visitor not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Visitor deleted." });
  } catch (error) {
    console.error("Delete visitor error:", error);
    return NextResponse.json(
      { error: "Failed to delete visitor." },
      { status: 500 }
    );
  }
}
