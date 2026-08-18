import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Appointment from "@/lib/models/appointment.model";
import Staff from "@/lib/models/staff.model";

function generatePreRegCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "PR-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") || "";
    const hostId = searchParams.get("hostId") || "";
    const date = searchParams.get("date") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const query: Record<string, unknown> = {
      organizationId: authUser.organizationId,
    };

    if (status) query.status = status;
    if (hostId) query.hostId = hostId;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.scheduledDate = { $gte: start, $lt: end };
    }

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .sort({ scheduledDate: 1, scheduledTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Appointment.countDocuments(query),
    ]);

    return NextResponse.json({
      ok: true,
      appointments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments." },
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
    const {
      visitorName,
      visitorEmail,
      visitorPhone,
      visitorCompany,
      purpose,
      hostId,
      scheduledDate,
      scheduledTime,
      expectedDuration,
      notes,
    } = body;

    if (!visitorName?.trim() || !purpose?.trim() || !hostId || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: "Visitor name, purpose, host, date, and time are required." },
        { status: 400 }
      );
    }

    // Verify host belongs to this org
    const host = await Staff.findOne({
      _id: hostId,
      organizationId: authUser.organizationId,
    });

    if (!host) {
      return NextResponse.json(
        { error: "Host not found in your organization." },
        { status: 404 }
      );
    }

    const preRegCode = generatePreRegCode();

    const appointment = await Appointment.create({
      visitorName: visitorName.trim(),
      visitorEmail: visitorEmail?.trim().toLowerCase() || "",
      visitorPhone: visitorPhone?.trim() || "",
      visitorCompany: visitorCompany?.trim() || "",
      purpose: purpose.trim(),
      hostId: host._id,
      hostName: host.name,
      organizationId: authUser.organizationId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime: scheduledTime.trim(),
      expectedDuration: expectedDuration || null,
      notes: notes?.trim() || "",
      preRegCode,
      createdBy: authUser.userId,
    });

    return NextResponse.json({ ok: true, appointment }, { status: 201 });
  } catch (error) {
    console.error("Create appointment error:", error);
    return NextResponse.json(
      { error: "Failed to create appointment." },
      { status: 500 }
    );
  }
}
