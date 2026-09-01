import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import Appointment from "@/lib/models/appointment.model";
import Visitor from "@/lib/models/visitor.model";
import Organization from "@/lib/models/organization.model";
import { notifyHost } from "@/lib/notifications/notify-host";
import { logEvent } from "@/lib/audit";

/**
 * Public route — pre-registered visitors check in using their pre-reg code.
 * Creates a visitor record and links it to the appointment.
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const { preRegCode, organizationSlug } = body;

    if (!preRegCode?.trim() || !organizationSlug?.trim()) {
      return NextResponse.json(
        { error: "Pre-registration code and organization are required." },
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

    const appointment = await Appointment.findOne({
      preRegCode: preRegCode.trim().toUpperCase(),
      organizationId: organization._id,
      status: "scheduled",
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "No active appointment found with this code. It may have been used or cancelled." },
        { status: 404 }
      );
    }

    // Generate visitor code
    const letters = appointment.visitorName.replace(/[^a-z]/gi, "");
    const first = letters.at(0)?.toUpperCase() ?? "V";
    const last = letters.at(-1)?.toUpperCase() ?? first;
    const randomNumber = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    const visitorCode = `${first}${last}${randomNumber}`;

    // Create visitor record
    const visitor = await Visitor.create({
      name: appointment.visitorName,
      email: appointment.visitorEmail || "",
      phone: appointment.visitorPhone || "",
      company: appointment.visitorCompany || "",
      purpose: appointment.purpose,
      staff: appointment.hostName,
      staffId: appointment.hostId,
      visitTargetType: "individual",
      assignmentStatus: "not_required",
      visitorCode,
      organizationId: organization._id,
      appointmentId: appointment._id,
      status: "Checked In",
      checkIn: new Date(),
    });

    // Update appointment
    appointment.status = "checked_in";
    appointment.visitorId = visitor._id;
    await appointment.save();

    // Notify host
    if (organization.settings?.notifyHostOnArrival !== false) {
      notifyHost({
        visitorName: appointment.visitorName,
        visitorCompany: appointment.visitorCompany,
        purpose: appointment.purpose,
        staffName: appointment.hostName,
        organizationId: organization._id.toString(),
        checkInTime: new Date(),
      }).catch((err) => console.error("Host notification error:", err));
    }

    // Audit log
    logEvent({
      action: "visitor.checked_in_via_appointment",
      entity: "visitor",
      entityId: visitor._id.toString(),
      organizationId: organization._id.toString(),
      details: {
        visitorName: appointment.visitorName,
        appointmentId: appointment._id.toString(),
        preRegCode: preRegCode.trim().toUpperCase(),
      },
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      visitor: {
        id: visitor._id,
        name: visitor.name,
        visitorCode: visitor.visitorCode,
        checkIn: visitor.checkIn,
        host: appointment.hostName,
        purpose: appointment.purpose,
      },
      appointment: {
        id: appointment._id,
        scheduledDate: appointment.scheduledDate,
        scheduledTime: appointment.scheduledTime,
      },
    });
  } catch (error) {
    console.error("Appointment check-in error:", error);
    return NextResponse.json(
      { error: "Failed to check in." },
      { status: 500 }
    );
  }
}
