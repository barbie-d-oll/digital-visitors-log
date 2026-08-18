import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import Blocklist from "@/lib/models/blocklist.model";
import Organization from "@/lib/models/organization.model";

/**
 * Public route — checks if a visitor is on the blocklist before allowing check-in.
 * Called during public registration to verify the visitor isn't blocked.
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const { name, phone, organizationSlug } = body;

    if (!organizationSlug) {
      return NextResponse.json({ ok: true, blocked: false });
    }

    const organization = await Organization.findOne({
      slug: organizationSlug.trim().toLowerCase(),
      status: "active",
    });

    if (!organization) {
      return NextResponse.json({ ok: true, blocked: false });
    }

    // Check by name or phone
    const conditions: Record<string, unknown>[] = [];
    if (name?.trim()) {
      conditions.push({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      });
    }
    if (phone?.trim()) {
      conditions.push({ phone: phone.trim() });
    }

    if (conditions.length === 0) {
      return NextResponse.json({ ok: true, blocked: false });
    }

    const entry = await Blocklist.findOne({
      organizationId: organization._id,
      status: "active",
      $or: conditions,
    }).lean();

    if (!entry) {
      return NextResponse.json({ ok: true, blocked: false });
    }

    return NextResponse.json({
      ok: true,
      blocked: entry.type === "blocked",
      watchlist: entry.type === "watchlist",
      reason: entry.type === "blocked" ? "This visitor has been blocked." : undefined,
    });
  } catch (error) {
    console.error("Blocklist check error:", error);
    return NextResponse.json({ ok: true, blocked: false });
  }
}
