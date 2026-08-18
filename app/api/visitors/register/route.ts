import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import Visitor from "@/lib/models/visitor.model";
import Organization from "@/lib/models/organization.model";
import Blocklist from "@/lib/models/blocklist.model";
import { notifyHost } from "@/lib/notifications/notify-host";
import { logEvent } from "@/lib/audit";

/**
 * Public visitor registration route.
 * Used by the QR code / public registration page.
 * Checks blocklist, detects returning visitors, notifies host.
 */
export async function POST(request: Request) {
  try {
    await connectToDB();

    const body = await request.json();
    const { name, phone, company, purpose, staff, organizationSlug, locationId } = body;

    if (!name?.trim() || !phone?.trim() || !purpose?.trim() || !staff?.trim()) {
      return NextResponse.json(
        { error: "Name, phone, purpose, and staff are required." },
        { status: 400 }
      );
    }

    if (!organizationSlug?.trim()) {
      return NextResponse.json(
        { error: "Organization is required." },
        { status: 400 }
      );
    }

    const organization = await Organization.findOne({
      slug: organizationSlug.trim().toLowerCase(),
      status: "active",
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found." },
        { status: 404 }
      );
    }

    // --- Blocklist Check ---
    const blockEntry = await Blocklist.findOne({
      organizationId: organization._id,
      status: "active",
      type: "blocked",
      $or: [
        { name: { $regex: new RegExp(`^${name.trim()}$`, "i") } },
        { phone: phone.trim() },
      ],
    });

    if (blockEntry) {
      return NextResponse.json(
        { error: "We're unable to complete your check-in. Please speak to the front desk." },
        { status: 403 }
      );
    }

    // --- Check if watchlisted (allow but flag) ---
    const watchEntry = await Blocklist.findOne({
      organizationId: organization._id,
      status: "active",
      type: "watchlist",
      $or: [
        { name: { $regex: new RegExp(`^${name.trim()}$`, "i") } },
        { phone: phone.trim() },
      ],
    });

    // --- Detect returning visitor ---
    const previousVisit = await Visitor.findOne({
      phone: phone.trim(),
      organizationId: organization._id,
    }).select("_id").lean();

    const isReturning = !!previousVisit;

    // --- Generate visitor code ---
    const visitorCode = generateVisitorCode(name);

    // --- Create visitor record ---
    const visitor = await Visitor.create({
      name: name.trim(),
      phone: phone.trim(),
      company: company?.trim() || "",
      purpose: purpose.trim(),
      staff: staff.trim(),
      visitorCode,
      organizationId: organization._id,
      locationId: locationId || undefined,
      status: "Checked In",
      checkIn: new Date(),
      isReturning,
    });

    // --- Notify host asynchronously ---
    if (organization.settings?.notifyHostOnArrival !== false) {
      notifyHost({
        visitorName: name.trim(),
        visitorCompany: company?.trim(),
        purpose: purpose.trim(),
        staffName: staff.trim(),
        organizationId: organization._id.toString(),
        checkInTime: new Date(),
      }).catch((err) => console.error("Host notification error:", err));
    }

    // --- Audit log ---
    logEvent({
      action: "visitor.checked_in",
      entity: "visitor",
      entityId: visitor._id.toString(),
      organizationId: organization._id.toString(),
      details: {
        visitorName: name.trim(),
        staff: staff.trim(),
        isReturning,
        watchlisted: !!watchEntry,
      },
    }).catch(() => {});

    return NextResponse.json(
      {
        ok: true,
        visitor: {
          id: visitor._id,
          name: visitor.name,
          visitorCode: visitor.visitorCode,
          checkIn: visitor.checkIn,
          isReturning,
        },
        requiresNda: organization.settings?.requireNda || false,
        watchlisted: !!watchEntry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Public visitor registration error:", error);
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
