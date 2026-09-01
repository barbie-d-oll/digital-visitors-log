import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Visitor from "@/lib/models/visitor.model";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const date = searchParams.get("date") || "";

    const query: Record<string, unknown> = {
      organizationId: authUser.organizationId,
    };

    if (status) {
      query.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.checkIn = { $gte: startOfDay, $lt: endOfDay };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { visitorCode: { $regex: search, $options: "i" } },
        { staff: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [visitors, total] = await Promise.all([
      Visitor.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Visitor.countDocuments(query),
    ]);

    return NextResponse.json({
      ok: true,
      visitors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get visitors error:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitors." },
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
    const { name, email, phone, company, purpose, staff, visitorCode } = body;

    if (!name?.trim() || !phone?.trim() || !purpose?.trim() || !staff?.trim()) {
      return NextResponse.json(
        { error: "Name, phone, purpose, and staff are required." },
        { status: 400 }
      );
    }

    const visitor = await Visitor.create({
      name: name.trim(),
      email:
        typeof email === "string" && email.trim()
          ? email.trim().toLowerCase()
          : undefined,
      phone: phone.trim(),
      company: company?.trim() || "",
      purpose: purpose.trim(),
      staff: staff.trim(),
      visitTargetType: "individual",
      assignmentStatus: "not_required",
      visitorCode: visitorCode || generateVisitorCode(name),
      organizationId: authUser.organizationId,
      status: "Checked In",
      checkIn: new Date(),
    });

    return NextResponse.json({ ok: true, visitor }, { status: 201 });
  } catch (error) {
    console.error("Create visitor error:", error);
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
