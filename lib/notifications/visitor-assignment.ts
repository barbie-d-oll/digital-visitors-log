import { connectToDB } from "@/lib/db/mongoose";
import Organization from "@/lib/models/organization.model";
import { smsConfig } from "@/lib/sms/sms-config";
import { sendEmail, visitorAssignmentEmail } from "@/lib/notifications/email";

export type AssignmentNotificationStatus =
  | "sent"
  | "failed"
  | "skipped";

type NotifyVisitorAssignmentParams = {
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  staffName: string;
  departmentName?: string;
  organizationId: string;
};

type NotifyVisitorAssignmentResult = {
  status: AssignmentNotificationStatus;
  error?: string;
};

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || "Visitor";
}

function getSmsText({
  visitorName,
  staffName,
  departmentName,
}: Pick<
  NotifyVisitorAssignmentParams,
  "visitorName" | "staffName" | "departmentName"
>) {
  const departmentText = departmentName ? ` from ${departmentName}` : "";

  return `Hello ${getFirstName(visitorName)}, ${staffName}${departmentText} has been assigned to meet you. Please wait at reception for instructions.`;
}

export async function notifyVisitorAssignment(
  params: NotifyVisitorAssignmentParams,
): Promise<NotifyVisitorAssignmentResult> {
  const {
    visitorName,
    visitorEmail,
    visitorPhone,
    staffName,
    departmentName,
    organizationId,
  } = params;

  await connectToDB();

  const organization = await Organization.findById(organizationId).select(
    "name settings",
  );
  const organizationName = organization?.name || "your host organization";
  const settings = organization?.settings;
  const errors: string[] = [];
  let attempted = false;
  let delivered = false;

  if (visitorEmail && settings?.emailNotifications !== false) {
    attempted = true;

    const { subject, html } = visitorAssignmentEmail({
      visitorName,
      hostName: staffName,
      departmentName,
      organizationName,
    });

    const sent = await sendEmail({
      to: visitorEmail,
      subject,
      html,
    });

    delivered = delivered || sent;
    if (!sent) {
      errors.push("Email delivery failed.");
    }
  }

  if (visitorPhone && settings?.smsEnabled) {
    attempted = true;

    try {
      await smsConfig({
        destinations: [visitorPhone],
        text: getSmsText({ visitorName, staffName, departmentName }),
        organizationId,
      });
      delivered = true;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "SMS delivery failed.");
    }
  }

  if (!attempted) {
    return {
      status: "skipped",
      error: "No visitor notification channel is enabled.",
    };
  }

  if (!delivered) {
    return {
      status: "failed",
      error: errors.join(" "),
    };
  }

  return {
    status: "sent",
    error: errors.length > 0 ? errors.join(" ") : undefined,
  };
}
