import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Visitor from "@/lib/models/visitor.model";

/**
 * Emergency evacuation list — returns all currently checked-in visitors.
 * One-click export for fire wardens / security.
 */
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const checkedInVisitors = await Visitor.find({
      organizationId: authUser.organizationId,
      status: "Checked In",
    })
      .sort({ checkIn: -1 })
      .select("name phone company staff checkIn visitorCode")
      .lean();

    return NextResponse.json({
      ok: true,
      count: checkedInVisitors.length,
      visitors: checkedInVisitors,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Emergency list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergency list." },
      { status: 500 }
    );
  }
}
