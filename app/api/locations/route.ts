import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Location from "@/lib/models/location.model";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const locations = await Location.find({
      organizationId: authUser.organizationId,
    })
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ ok: true, locations });
  } catch (error) {
    console.error("Get locations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations." },
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

    if (authUser.role === "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDB();

    const body = await request.json();
    const { name, address, phone, timezone, settings } = body;

    if (!name?.trim() || !address?.trim()) {
      return NextResponse.json(
        { error: "Name and address are required." },
        { status: 400 }
      );
    }

    const location = await Location.create({
      name: name.trim(),
      address: address.trim(),
      phone: phone?.trim() || "",
      timezone: timezone || "Africa/Accra",
      settings: settings || {},
      organizationId: authUser.organizationId,
    });

    return NextResponse.json({ ok: true, location }, { status: 201 });
  } catch (error) {
    console.error("Create location error:", error);
    return NextResponse.json(
      { error: "Failed to create location." },
      { status: 500 }
    );
  }
}
