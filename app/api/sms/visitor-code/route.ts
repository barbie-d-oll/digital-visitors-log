import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import Organization from "@/lib/models/organization.model";
import { smsConfig } from "@/lib/sms/sms-config";

type VisitorCodePayload = {
  name: string;
  phone: string;
  visitorCode: string;
  organizationSlug?: string;
};

const getStringValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const createVisitorCodeMessage = ({
  name,
  visitorCode,
}: Pick<VisitorCodePayload, "name" | "visitorCode">) => {
  const firstName = name.split(/\s+/)[0] || "Visitor";

  return `Hello ${firstName}, your sign-out code is ${visitorCode}. Please use this code when leaving the company.`;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const values: VisitorCodePayload = {
      name: getStringValue(payload.name),
      phone: getStringValue(payload.phone),
      visitorCode: getStringValue(payload.visitorCode).toUpperCase(),
      organizationSlug: getStringValue(payload.organizationSlug),
    };

    if (!values.name || !values.phone || !values.visitorCode) {
      return NextResponse.json(
        { error: "Name, phone number, and visitor code are required." },
        { status: 400 }
      );
    }

    let organizationId: string | undefined;

    if (values.organizationSlug) {
      await connectToDB();
      const org = await Organization.findOne({
        slug: values.organizationSlug.toLowerCase(),
        status: "active",
      }).select("_id");

      if (org) {
        organizationId = org._id.toString();
      }
    }

    await smsConfig({
      destinations: [values.phone],
      text: createVisitorCodeMessage(values),
      organizationId,
    });

    return NextResponse.json({
      ok: true,
      message: "Visitor code SMS sent successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "We couldn't send the visitor code SMS.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
