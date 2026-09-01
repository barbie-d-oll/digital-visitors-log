import mongoose from "mongoose";

import { connectToDB } from "@/lib/db/mongoose";
import Staff from "@/lib/models/staff.model";
import Department from "@/lib/models/department.model";
import Organization from "@/lib/models/organization.model";
import {
  departmentAssignmentRequestEmail,
  sendEmail,
  visitorArrivalEmail,
} from "./email";
import { sendSlackNotification } from "./slack";
import { smsConfig } from "@/lib/sms/sms-config";

interface NotifyHostParams {
  visitorName: string;
  visitorCompany?: string;
  purpose: string;
  staffName: string;
  staffId?: string;
  departmentId?: string;
  organizationId: string;
  checkInTime: Date;
  visitTargetType?: "individual" | "department";
}

/**
 * Notifies the host AND the department head via all available channels
 * (email, SMS, Slack) when a visitor checks in.
 */
export async function notifyHost(params: NotifyHostParams): Promise<void> {
  const {
    visitorName,
    visitorCompany,
    purpose,
    staffName,
    staffId,
    departmentId,
    organizationId,
    checkInTime,
    visitTargetType = "individual",
  } = params;

  try {
    await connectToDB();

    const org = await Organization.findById(organizationId);
    const orgName = org?.name || "Your Organization";

    if (visitTargetType === "department") {
      const department = await findDepartment({
        departmentId,
        departmentName: staffName,
        organizationId,
      });

      if (!department) {
        console.warn(`Department "${staffName}" not found for notification.`);
        return;
      }

      const headIds = getDepartmentHeadIds(department);
      if (headIds.length === 0) {
        console.warn(`Department "${staffName}" has no head for notification.`);
        return;
      }

      const heads = await Staff.find({
        _id: { $in: headIds },
        organizationId,
        status: "active",
      });

      if (heads.length === 0) {
        console.warn(`Department head for "${department.name}" not found.`);
        return;
      }

      await Promise.all(
        heads.map((head) =>
          notifyPerson({
            person: { name: head.name, email: head.email, phone: head.phone },
            visitorName,
            visitorCompany,
            purpose,
            orgName,
            organizationId,
            checkInTime,
            org,
            isDepartmentHead: true,
            departmentName: department.name,
            requiresAssignment: true,
            assignmentUrl: getDepartmentAssignmentsUrl(),
          }),
        ),
      );

      return;
    }

    // Find the staff member (host)
    const host = await findHost({
      organizationId,
      staffId,
      staffName,
    });

    if (!host) {
      console.warn(`Host "${staffName}" not found for notification.`);
      return;
    }

    // --- Notify the host ---
    await notifyPerson({
      person: { name: host.name, email: host.email, phone: host.phone },
      visitorName,
      visitorCompany,
      purpose,
      orgName,
      organizationId,
      checkInTime,
      org,
    });

    // --- Notify the department head (if different from the host) ---
    if (host.departmentId) {
      const department = await Department.findById(host.departmentId).select(
        "name headId headIds",
      );

      if (department) {
        const headIds = getDepartmentHeadIds(department).filter(
          (headId) => headId !== host._id.toString(),
        );
        const heads = await Staff.find({
          _id: { $in: headIds },
          organizationId,
          status: "active",
        });

        await Promise.all(
          heads.map((head) =>
            notifyPerson({
              person: { name: head.name, email: head.email, phone: head.phone },
              visitorName,
              visitorCompany,
              purpose,
              orgName,
              organizationId,
              checkInTime,
              org,
              isDepartmentHead: true,
              departmentName: department.name,
            }),
          ),
        );
      }
    }
  } catch (error) {
    console.error("Notify host error:", error);
  }
}

async function findHost({
  organizationId,
  staffId,
  staffName,
}: {
  organizationId: string;
  staffId?: string;
  staffName: string;
}) {
  if (staffId && mongoose.isValidObjectId(staffId)) {
    const host = await Staff.findOne({
      _id: staffId,
      organizationId,
      status: "active",
    });

    if (host) {
      return host;
    }
  }

  return Staff.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(staffName.trim())}$`, "i") },
    organizationId,
    status: "active",
  });
}

async function findDepartment({
  departmentId,
  departmentName,
  organizationId,
}: {
  departmentId?: string;
  departmentName: string;
  organizationId: string;
}) {
  if (departmentId && mongoose.isValidObjectId(departmentId)) {
    const department = await Department.findOne({
      _id: departmentId,
      organizationId,
      status: "active",
    }).select("name headId headIds");

    if (department) {
      return department;
    }
  }

  return Department.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(departmentName.trim())}$`, "i") },
    organizationId,
    status: "active",
  }).select("name headId headIds");
}

function getObjectId(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return mongoose.isValidObjectId(value) ? value : null;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === "object" && "_id" in value) {
    return getObjectId((value as { _id?: unknown })._id);
  }

  const valueWithToString = value as { toString?: () => string };
  if (typeof valueWithToString.toString === "function") {
    const id = valueWithToString.toString();
    return mongoose.isValidObjectId(id) ? id : null;
  }

  return null;
}

function getDepartmentHeadIds(department: {
  headId?: unknown;
  headIds?: unknown;
}) {
  const headIds = Array.isArray(department.headIds)
    ? department.headIds.map(getObjectId).filter((id): id is string => Boolean(id))
    : [];

  const fallbackHeadId = getObjectId(department.headId);
  if (headIds.length === 0 && fallbackHeadId) {
    headIds.push(fallbackHeadId);
  }

  return Array.from(new Set(headIds)).slice(0, 2);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getDepartmentAssignmentsUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  return baseUrl ? `${baseUrl}/dashboard/department-assignments` : undefined;
}

interface NotifyPersonParams {
  person: { name: string; email?: string; phone?: string };
  visitorName: string;
  visitorCompany?: string;
  purpose: string;
  orgName: string;
  organizationId: string;
  checkInTime: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  org: any;
  isDepartmentHead?: boolean;
  departmentName?: string;
  requiresAssignment?: boolean;
  assignmentUrl?: string;
}

async function notifyPerson(params: NotifyPersonParams): Promise<void> {
  const {
    person,
    visitorName,
    visitorCompany,
    purpose,
    orgName,
    organizationId,
    checkInTime,
    org,
    isDepartmentHead,
    departmentName,
    requiresAssignment,
    assignmentUrl,
  } = params;

  const settings = org && "settings" in org ? (org.settings as Record<string, unknown>) : null;

  // Email notification (only if org has email notifications enabled)
  if (person.email && settings?.emailNotifications !== false) {
    const { subject, html } = requiresAssignment
      ? departmentAssignmentRequestEmail({
          visitorName,
          visitorCompany,
          purpose,
          headName: person.name,
          departmentName,
          organizationName: orgName,
          checkInTime,
          assignmentUrl,
        })
      : visitorArrivalEmail({
          visitorName,
          visitorCompany,
          purpose,
          hostName: person.name,
          organizationName: orgName,
          checkInTime,
        });

    sendEmail({ to: person.email, subject, html }).catch((err) =>
      console.error(`${isDepartmentHead ? "Dept head" : "Host"} email notification failed:`, err)
    );
  }

  // SMS notification
  if (person.phone && settings?.smsEnabled) {
    const role = isDepartmentHead ? `(Dept Head - ${departmentName})` : "";
    const message = requiresAssignment
      ? `Hi ${person.name.split(" ")[0]}${role ? " " + role : ""}, ${visitorName}${visitorCompany ? ` from ${visitorCompany}` : ""} is waiting for ${departmentName || "your department"}. Please assign a staff member in Visitor Log.`
      : `Hi ${person.name.split(" ")[0]}${role ? " " + role : ""}, ${visitorName}${visitorCompany ? ` from ${visitorCompany}` : ""} has arrived for a ${purpose.toLowerCase()}. Please head to reception.`;

    smsConfig({
      destinations: [person.phone],
      text: message,
      organizationId,
    }).catch((err) =>
      console.error(`${isDepartmentHead ? "Dept head" : "Host"} SMS notification failed:`, err)
    );
  }

  // Slack/Teams notification (only once, not per-person)
  if (!isDepartmentHead) {
    const webhookUrl = (settings?.slackWebhookUrl || settings?.teamsWebhookUrl) as string | undefined;
    if (webhookUrl) {
      sendSlackNotification({
        webhookUrl,
        visitorName,
        visitorCompany,
        purpose,
        hostName: person.name,
        checkInTime,
      }).catch((err) => console.error("Slack/Teams notification failed:", err));
    }
  }
}
