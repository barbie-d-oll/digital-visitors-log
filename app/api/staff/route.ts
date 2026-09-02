import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import {
  ensureStaffLoginAccess,
  summarizeStaffLoginProvision,
} from "@/lib/auth/staff-login";
import Department from "@/lib/models/department.model";
import Staff from "@/lib/models/staff.model";
import { getErrorMessage } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const departmentId = searchParams.get("departmentId") || "";

    const query: Record<string, unknown> = {
      organizationId: authUser.organizationId,
    };

    if (departmentId) {
      query.departmentId = departmentId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }

    const staff = await Staff.find(query)
      .populate("departmentId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ ok: true, staff });
  } catch (error) {
    console.error("Get staff error:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff." },
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

    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const departmentId =
      typeof body.departmentId === "string" ? body.departmentId.trim() : "";
    const position =
      typeof body.position === "string" ? body.position.trim() : "";

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

    if (departmentId) {
      const departmentExists = await Department.exists({
        _id: departmentId,
        organizationId: authUser.organizationId,
      });

      if (!departmentExists) {
        return NextResponse.json(
          { error: "Please choose a valid department." },
          { status: 400 }
        );
      }
    }

    // Check for duplicate email within org
    const existing = await Staff.findOne({
      email,
      organizationId: authUser.organizationId,
    });

    if (existing) {
      return NextResponse.json(
        { error: "A staff member with this email already exists." },
        { status: 409 }
      );
    }

    const loginAccess = await ensureStaffLoginAccess({
      name,
      email,
      organizationId: authUser.organizationId,
      invitedByUserId: authUser.userId,
    });

    const member = await Staff.create({
      name,
      email,
      phone,
      departmentId: departmentId || undefined,
      position,
      organizationId: authUser.organizationId,
    });

    const loginSummary = summarizeStaffLoginProvision([loginAccess]);
    const message =
      loginSummary.created === 0
        ? "Staff added successfully. This person already has login access."
        : loginSummary.failed === 0
          ? "Staff added successfully. Login details were emailed to them."
          : "Staff added successfully, but login details could not be emailed. Please check email settings.";

    return NextResponse.json(
      {
        ok: true,
        staff: member,
        message,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create staff error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to create staff member.") },
      { status: 500 }
    );
  }
}
