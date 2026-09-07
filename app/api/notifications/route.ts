import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Visitor from "@/lib/models/visitor.model";
import Appointment from "@/lib/models/appointment.model";

export type NotificationType =
  | "check_in"
  | "check_out"
  | "assignment"
  | "appointment"
  | "system";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
  link: string;
  priority: "high" | "normal";
};

function formatTimeAgo(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000),
  );

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const [checkedInVisitors, checkedOutVisitors, pendingAssignments, upcomingAppointments] =
      await Promise.all([
        Visitor.find({
          organizationId: authUser.organizationId,
          status: "Checked In",
        })
          .sort({ checkIn: -1, createdAt: -1 })
          .limit(5)
          .lean(),

        Visitor.find({
          organizationId: authUser.organizationId,
          status: { $in: ["Signed Out", "Checked Out"] },
        })
          .sort({ checkOut: -1, updatedAt: -1 })
          .limit(3)
          .lean(),

        Visitor.find({
          organizationId: authUser.organizationId,
          assignmentStatus: "pending",
        })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean(),

        Appointment.find({
          organizationId: authUser.organizationId,
          status: "scheduled",
        })
          .sort({ scheduledDate: 1, scheduledTime: 1 })
          .limit(3)
          .lean(),
      ]);

    const notifications: NotificationItem[] = [];

    // Pending assignments (High Priority)
    for (const v of pendingAssignments) {
      const ts = v.createdAt || new Date();
      notifications.push({
        id: `assign-${v._id}`,
        type: "assignment",
        title: "Assignment Pending",
        description: `${v.name} needs a host assigned for ${v.departmentName || "department"}.`,
        timestamp: new Date(ts).toISOString(),
        timeAgo: formatTimeAgo(ts),
        link: "/dashboard/department-assignments",
        priority: "high",
      });
    }

    // Checked-in visitors
    for (const v of checkedInVisitors) {
      const ts = v.checkIn || v.createdAt || new Date();
      notifications.push({
        id: `in-${v._id}`,
        type: "check_in",
        title: "Visitor Checked In",
        description: `${v.name}${v.company ? ` (${v.company})` : ""} arrived to see ${v.staff || v.departmentName || "Host"}.`,
        timestamp: new Date(ts).toISOString(),
        timeAgo: formatTimeAgo(ts),
        link: "/dashboard/visitor",
        priority: "normal",
      });
    }

    // Checked-out visitors
    for (const v of checkedOutVisitors) {
      const ts = v.checkOut || v.updatedAt || new Date();
      notifications.push({
        id: `out-${v._id}`,
        type: "check_out",
        title: "Visitor Signed Out",
        description: `${v.name} completed their visit and departed.`,
        timestamp: new Date(ts).toISOString(),
        timeAgo: formatTimeAgo(ts),
        link: "/dashboard/visitor",
        priority: "normal",
      });
    }

    // Upcoming appointments
    for (const a of upcomingAppointments) {
      const ts = a.createdAt || new Date();
      const schedDate = a.scheduledDate ? new Date(a.scheduledDate).toLocaleDateString() : "Today";
      notifications.push({
        id: `app-${a._id}`,
        type: "appointment",
        title: "Upcoming Appointment",
        description: `${a.visitorName} with ${a.hostName} on ${schedDate} at ${a.scheduledTime}.`,
        timestamp: new Date(ts).toISOString(),
        timeAgo: formatTimeAgo(ts),
        link: "/dashboard/appointments",
        priority: "normal",
      });
    }

    // Sort by timestamp descending
    notifications.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return NextResponse.json({
      ok: true,
      notifications: notifications.slice(0, 10),
      count: notifications.length,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications." },
      { status: 500 },
    );
  }
}
