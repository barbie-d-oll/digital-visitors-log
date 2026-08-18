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
