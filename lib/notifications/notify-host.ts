import { connectToDB } from "@/lib/db/mongoose";
import Staff from "@/lib/models/staff.model";
import Department from "@/lib/models/department.model";
import Organization from "@/lib/models/organization.model";
import { sendEmail, visitorArrivalEmail } from "./email";
import { sendSlackNotification } from "./slack";
import { smsConfig } from "@/lib/sms/sms-config";

interface NotifyHostParams {
  visitorName: string;
  visitorCompany?: string;
  purpose: string;
  staffName: string;
  organizationId: string;
  checkInTime: Date;
}

/**
 * Notifies the host AND the department head via all available channels
 * (email, SMS, Slack) when a visitor checks in.
 */
export async function notifyHost(params: NotifyHostParams): Promise<void> {
  const { visitorName, visitorCompany, purpose, staffName, organizationId, checkInTime } = params;

  try {
    await connectToDB();

    // Find the staff member (host)
    const host = await Staff.findOne({
      name: { $regex: new RegExp(`^${staffName.trim()}$`, "i") },
      organizationId,
    });

    if (!host) {
      console.warn(`Host "${staffName}" not found for notification.`);
      return;
    }

    const org = await Organization.findById(organizationId);
    const orgName = org?.name || "Your Organization";

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
      const department = await Department.findById(host.departmentId).populate("headId");

      if (department?.headId) {
        const head = await Staff.findById(department.headId);

        if (head && head._id.toString() !== host._id.toString()) {
          await notifyPerson({
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
          });
        }
      }
    }
  } catch (error) {
    console.error("Notify host error:", error);
  }
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
  } = params;

  const settings = org && "settings" in org ? (org.settings as Record<string, unknown>) : null;

  // Email notification (only if org has email notifications enabled)
  if (person.email && settings?.emailNotifications !== false) {
    const { subject, html } = visitorArrivalEmail({
      visitorName,
      visitorCompany,
      purpose,
      hostName: person.name,
      organizationName: orgName,
      checkInTime,
    });

    const emailSubject = isDepartmentHead
      ? `🏢 ${visitorName} has arrived at ${departmentName} department`
      : subject;

    sendEmail({ to: person.email, subject: emailSubject, html }).catch((err) =>
      console.error(`${isDepartmentHead ? "Dept head" : "Host"} email notification failed:`, err)
    );
  }

  // SMS notification
  if (person.phone && settings?.smsEnabled) {
    const role = isDepartmentHead ? `(Dept Head - ${departmentName})` : "";
    const message = `Hi ${person.name.split(" ")[0]}${role ? " " + role : ""}, ${visitorName}${visitorCompany ? ` from ${visitorCompany}` : ""} has arrived for a ${purpose.toLowerCase()}. Please head to reception.`;

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
