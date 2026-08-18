import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Blocklist from "@/lib/models/blocklist.model";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type") || "";

    const query: Record<string, unknown> = {
      organizationId: authUser.organizationId,
      status: "active",
    };

    if (type) query.type = type;

    const entries = await Blocklist.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ ok: true, entries });
  } catch (error) {
    console.error("Get blocklist error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocklist." },
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
    const { name, email, phone, reason, type } = body;

    if (!name?.trim() || !reason?.trim()) {
      return NextResponse.json(
        { error: "Name and reason are required." },
        { status: 400 }
      );
    }

    const entry = await Blocklist.create({
      name: name.trim(),
      email: email?.trim().toLowerCase() || "",
      phone: phone?.trim() || "",
      reason: reason.trim(),
      type: type || "blocked",
      organizationId: authUser.organizationId,
      addedBy: authUser.userId,
    });

    return NextResponse.json({ ok: true, entry }, { status: 201 });
  } catch (error) {
    console.error("Create blocklist error:", error);
    return NextResponse.json(
      { error: "Failed to add to blocklist." },
      { status: 500 }
    );
  }
}
