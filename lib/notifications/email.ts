import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "Visitor Log <noreply@visitorlog.app>";

function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const { to, subject, html, from = EMAIL_FROM } = options;

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("Email not configured: SMTP_USER or SMTP_PASS missing. Skipping email.");
    return false;
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

export function visitorArrivalEmail({
  visitorName,
  visitorCompany,
  purpose,
  hostName,
  organizationName,
  checkInTime,
}: {
  visitorName: string;
  visitorCompany?: string;
  purpose: string;
  hostName: string;
  organizationName: string;
  checkInTime: Date;
}): { subject: string; html: string } {
  const time = checkInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return {
    subject: `🏢 ${visitorName} has arrived to see you`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; background: #ffffff;">
          <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #1b6b61;">
            Visitor Arrival
          </p>
          <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #111827;">
            Your guest has arrived
          </h1>
          <p style="margin: 0 0 24px; font-size: 15px; color: #6b7280; line-height: 1.6;">
            Hi ${hostName}, a visitor has checked in to see you at ${organizationName}.
          </p>
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Visitor</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">${visitorName}</td>
              </tr>
              ${visitorCompany ? `<tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Company</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">${visitorCompany}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Purpose</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">${purpose}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Arrived at</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">${time}</td>
              </tr>
            </table>
          </div>
          
          <p style="margin: 0; font-size: 13px; color: #9ca3af;">
            Please head to reception to greet your visitor.
          </p>
        </div>
        
        <p style="margin: 16px 0 0; text-align: center; font-size: 11px; color: #9ca3af;">
          Sent by ${organizationName} via Visitor Log
        </p>
      </div>
    `,
  };
}

export function departmentAssignmentRequestEmail({
  visitorName,
  visitorCompany,
  purpose,
  headName,
  departmentName,
  organizationName,
  checkInTime,
  assignmentUrl,
}: {
  visitorName: string;
  visitorCompany?: string;
  purpose: string;
  headName: string;
  departmentName?: string;
  organizationName: string;
  checkInTime: Date;
  assignmentUrl?: string;
}): { subject: string; html: string } {
  const time = checkInTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    subject: `${visitorName} is waiting for ${departmentName || "your department"}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; background: #ffffff;">
          <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #1b6b61;">
            Department Visitor
          </p>
          <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #111827;">
            Assign a host
          </h1>
          <p style="margin: 0 0 24px; font-size: 15px; color: #6b7280; line-height: 1.6;">
            Hi ${headName}, a visitor checked in for ${departmentName || "your department"} at ${organizationName}. Please assign an available staff member.
          </p>

          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Visitor</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">${visitorName}</td>
              </tr>
              ${visitorCompany ? `<tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Company</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">${visitorCompany}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Purpose</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">${purpose}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Arrived at</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">${time}</td>
              </tr>
            </table>
          </div>

          ${assignmentUrl ? `<a href="${assignmentUrl}" style="display: inline-block; padding: 13px 20px; background: #1b6b61; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Open Assignment Queue
          </a>` : ""}
        </div>

        <p style="margin: 16px 0 0; text-align: center; font-size: 11px; color: #9ca3af;">
          Sent by ${organizationName} via Visitor Log
        </p>
      </div>
    `,
  };
}

export function appointmentReminderEmail({
  visitorName,
  hostName,
  scheduledDate,
  scheduledTime,
  purpose,
  organizationName,
}: {
  visitorName: string;
  hostName: string;
  scheduledDate: string;
  scheduledTime: string;
  purpose: string;
  organizationName: string;
}): { subject: string; html: string } {
  return {
    subject: `📅 Reminder: ${visitorName} visiting tomorrow at ${scheduledTime}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; background: #ffffff;">
          <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #1b6b61;">
            Appointment Reminder
          </p>
          <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #111827;">
            Upcoming visitor
          </h1>
          <p style="margin: 0 0 24px; font-size: 15px; color: #6b7280; line-height: 1.6;">
            Hi ${hostName}, you have a scheduled visitor.
          </p>
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Visitor</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">${visitorName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Date</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">${scheduledDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Time</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">${scheduledTime}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Purpose</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">${purpose}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <p style="margin: 16px 0 0; text-align: center; font-size: 11px; color: #9ca3af;">
          Sent by ${organizationName} via Visitor Log
        </p>
      </div>
    `,
  };
}

export function visitorAssignmentEmail({
  visitorName,
  hostName,
  departmentName,
  organizationName,
}: {
  visitorName: string;
  hostName: string;
  departmentName?: string;
  organizationName: string;
}): { subject: string; html: string } {
  return {
    subject: `You can now meet ${hostName} at ${organizationName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; background: #ffffff;">
          <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #1b6b61;">
            Visit Assigned
          </p>
          <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #111827;">
            Your host is ready
          </h1>
          <p style="margin: 0 0 24px; font-size: 15px; color: #6b7280; line-height: 1.6;">
            Hi ${visitorName}, ${hostName} has been assigned to meet you at ${organizationName}.
          </p>

          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Assigned host</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">${hostName}</td>
              </tr>
              ${departmentName ? `<tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Department</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">${departmentName}</td>
              </tr>` : ""}
            </table>
          </div>

          <p style="margin: 0; font-size: 13px; color: #9ca3af;">
            Please wait at reception for instructions.
          </p>
        </div>

        <p style="margin: 16px 0 0; text-align: center; font-size: 11px; color: #9ca3af;">
          Sent by ${organizationName} via Visitor Log
        </p>
      </div>
    `,
  };
}

export function passwordResetEmail({
  userName,
  resetUrl,
}: {
  userName: string;
  resetUrl: string;
}): { subject: string; html: string } {
  return {
    subject: "Reset your password — Visitor Log",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; background: #ffffff;">
          <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #111827;">
            Reset your password
          </h1>
          <p style="margin: 0 0 24px; font-size: 15px; color: #6b7280; line-height: 1.6;">
            Hi ${userName}, someone requested a password reset for your Visitor Log account. Click the button below to choose a new password.
          </p>
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: #1b6b61; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Reset Password
          </a>
          <p style="margin: 24px 0 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
            This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  };
}

export function memberInviteEmail({
  organizationName,
  role,
  inviteUrl,
}: {
  organizationName: string;
  role: string;
  inviteUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `You've been invited to ${organizationName} on Visitor Log`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; background: #ffffff;">
          <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #111827;">
            You're invited!
          </h1>
          <p style="margin: 0 0 24px; font-size: 15px; color: #6b7280; line-height: 1.6;">
            You've been invited to join <strong>${organizationName}</strong> as ${role === "admin" ? "an admin" : "a team member"} on Visitor Log.
          </p>
          <a href="${inviteUrl}" style="display: inline-block; padding: 14px 28px; background: #1b6b61; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Accept Invitation
          </a>
        </div>
      </div>
    `,
  };
}

export function staffWelcomeEmail({
  userName,
  organizationName,
  email,
  password,
  loginUrl,
}: {
  userName: string;
  organizationName: string;
  email: string;
  password: string;
  loginUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Your ${organizationName} login details are ready`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; background: #ffffff;">
          <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #1b6b61;">
            Welcome
          </p>
          <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #111827;">
            Your Visitor Log account is ready
          </h1>
          <p style="margin: 0 0 24px; font-size: 15px; color: #6b7280; line-height: 1.6;">
            Hi ${userName}, your account for <strong>${organizationName}</strong> has been created. Please use the details below to log in and change your password after your first sign in.
          </p>

          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b7280; width: 120px;">Email</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #111827;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Temporary password</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #111827;">${password}</td>
              </tr>
            </table>
          </div>

          <a href="${loginUrl}" style="display: inline-block; padding: 14px 28px; background: #1b6b61; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; margin-bottom: 18px;">
            Login to Visitor Log
          </a>

          <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
            For security, please change this password after you sign in.
          </p>
        </div>
      </div>
    `,
  };
}

export function userWelcomeRegistrationEmail({
  userName,
  organizationName,
  email,
  loginUrl,
}: {
  userName: string;
  organizationName: string;
  email: string;
  loginUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `🎉 Welcome to Visitor Log — ${organizationName} is ready`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; background: #ffffff;">
          <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #1b6b61;">
            Getting Started
          </p>
          <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #111827;">
            Welcome to Visitor Log!
          </h1>
          <p style="margin: 0 0 20px; font-size: 15px; color: #4b5563; line-height: 1.6;">
            Hi ${userName}, thank you for registering <strong>${organizationName}</strong>. Your modern reception and visitor management desk is ready for action.
          </p>

          <div style="background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 130px;">Organization</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #111827;">${organizationName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Account Email</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #111827;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Status</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #16a34a;">Active</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 28px;">
            <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #111827;">
              Recommended next steps:
            </p>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4b5563; line-height: 1.7;">
              <li>Add your company departments and hosts.</li>
              <li>Invite staff members to handle check-ins and appointments.</li>
              <li>Customize your kiosk branding with your company logo and theme.</li>
            </ul>
          </div>

          <a href="${loginUrl}" style="display: inline-block; padding: 14px 28px; background: #1b6b61; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; margin-bottom: 18px;">
            Sign In to Your Workspace
          </a>

          <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
            Need assistance? Reach out to your system administrator or reply to this email.
          </p>
        </div>

        <p style="margin: 16px 0 0; text-align: center; font-size: 11px; color: #9ca3af;">
          Sent by ${organizationName} via Visitor Log
        </p>
      </div>
    `,
  };
}

export function userFirstLoginNotificationEmail({
  userName,
  organizationName,
  email,
  loginTime,
  dashboardUrl,
}: {
  userName: string;
  organizationName: string;
  email: string;
  loginTime: Date;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const formattedTime = loginTime.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return {
    subject: `🔐 First Login Detected — ${organizationName} on Visitor Log`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; background: #ffffff;">
          <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #1b6b61;">
            Security & Welcome Notice
          </p>
          <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #111827;">
            First sign-in to your desk
          </h1>
          <p style="margin: 0 0 20px; font-size: 15px; color: #4b5563; line-height: 1.6;">
            Hi ${userName}, you have successfully signed in to <strong>${organizationName}</strong> for the first time.
          </p>

          <div style="background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 130px;">Time of Login</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #111827;">${formattedTime}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Account Email</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #111827;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Organization</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #111827;">${organizationName}</td>
              </tr>
            </table>
          </div>

          <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 28px; background: #1b6b61; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; margin-bottom: 18px;">
            Open Reception Dashboard
          </a>

          <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
            If you did not initiate this login, please contact your administrator or reset your password immediately.
          </p>
        </div>

        <p style="margin: 16px 0 0; text-align: center; font-size: 11px; color: #9ca3af;">
          Sent by ${organizationName} via Visitor Log
        </p>
      </div>
    `,
  };
}

