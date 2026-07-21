import { NextResponse } from "next/server";

import { smsConfig } from "@/lib/sms/sms-config";

type VisitorCodePayload = {
  name: string;
  phone: string;
  visitorCode: string;
};

const getStringValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const createVisitorCodeMessage = ({
  name,
  visitorCode,
}: Pick<VisitorCodePayload, "name" | "visitorCode">) => {
  const firstName = name.split(/\s+/)[0] || "Visitor";

  return `Hello ${firstName},  code is ${visitorCode}. Please use this code when leaving the company.`;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const values: VisitorCodePayload = {
      name: getStringValue(payload.name),
      phone: getStringValue(payload.phone),
      visitorCode: getStringValue(payload.visitorCode).toUpperCase(),
    };

    if (!values.name || !values.phone || !values.visitorCode) {
      return NextResponse.json(
        {
          error: "Name, phone number, and visitor code are required.",
        },
        { status: 400 },
      );
    }

    await smsConfig({
      destinations: [values.phone],
      text: createVisitorCodeMessage(values),
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
