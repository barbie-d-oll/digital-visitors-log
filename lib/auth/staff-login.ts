import type { Types } from "mongoose";

import { generateTemporaryPassword, hashPassword } from "@/lib/auth/password";
import Membership from "@/lib/models/membership.model";
import Organization from "@/lib/models/organization.model";
import User from "@/lib/models/user.model";
import { sendEmail, staffWelcomeEmail } from "@/lib/notifications/email";

type AccessRole = "owner" | "admin" | "staff";

type EnsureStaffLoginAccessInput = {
  name: string;
  email: string;
  organizationId: string;
  invitedByUserId: string;
};

export type StaffLoginProvisionResult = {
  email: string;
  temporaryPasswordCreated: boolean;
  credentialsSent: boolean;
};

function getLoginUrl() {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    .replace(/\/$/, "");

  return `${baseUrl}/auth/login`;
}

function getAccessRole(role: string): AccessRole {
  return role === "owner" || role === "admin" ? role : "staff";
}

async function ensureActiveMembership({
  userId,
  organizationId,
  role,
  invitedByUserId,
}: {
  userId: Types.ObjectId;
  organizationId: string;
  role: AccessRole;
  invitedByUserId: string;
}) {
  const existingMembership = await Membership.findOne({
    userId,
    organizationId,
  });

  if (!existingMembership) {
    await Membership.create({
      userId,
      organizationId,
      role,
      status: "active",
      invitedBy: invitedByUserId,
      joinedAt: new Date(),
    });
    return;
  }

  let changed = false;

  if (existingMembership.status !== "active") {
    existingMembership.status = "active";
    changed = true;
  }

  if (!existingMembership.joinedAt) {
    existingMembership.joinedAt = new Date();
    changed = true;
  }

  if (changed) {
    await existingMembership.save();
  }
}

export async function ensureStaffLoginAccess({
  name,
  email,
  organizationId,
  invitedByUserId,
}: EnsureStaffLoginAccessInput): Promise<StaffLoginProvisionResult> {
  const normalizedEmail = email.trim().toLowerCase();
  let temporaryPassword: string | null = null;
  let user = await User.findOne({
    email: normalizedEmail,
    organizationId,
  }).select("+password");

  if (!user) {
    temporaryPassword = generateTemporaryPassword();
    user = await User.create({
      name,
      email: normalizedEmail,
      password: await hashPassword(temporaryPassword),
      role: "staff",
      organizationId,
      authProvider: "credentials",
      status: "active",
    });
  } else if (!user.password) {
    temporaryPassword = generateTemporaryPassword();
    user.password = await hashPassword(temporaryPassword);
    user.status = "active";
    user.role = getAccessRole(user.role);
    await user.save();
  }

  await ensureActiveMembership({
    userId: user._id as Types.ObjectId,
    organizationId,
    role: getAccessRole(user.role),
    invitedByUserId,
  });

  if (!temporaryPassword) {
    return {
      email: normalizedEmail,
      temporaryPasswordCreated: false,
      credentialsSent: false,
    };
  }

  const organization = await Organization.findById(organizationId).lean();
  const { subject, html } = staffWelcomeEmail({
    userName: name,
    organizationName: organization?.name || "your organization",
    email: normalizedEmail,
    password: temporaryPassword,
    loginUrl: getLoginUrl(),
  });

  const credentialsSent = await sendEmail({
    to: normalizedEmail,
    subject,
    html,
  });

  return {
    email: normalizedEmail,
    temporaryPasswordCreated: true,
    credentialsSent,
  };
}

export function summarizeStaffLoginProvision(
  results: StaffLoginProvisionResult[],
) {
  const created = results.filter(
    (result) => result.temporaryPasswordCreated,
  ).length;
  const sent = results.filter((result) => result.credentialsSent).length;

  return {
    created,
    sent,
    failed: created - sent,
  };
}
