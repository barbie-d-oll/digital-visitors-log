import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import AuditLog from "@/lib/models/audit-log.model";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only owners/admins can view audit logs
    if (authUser.role === "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDB();

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const entity = searchParams.get("entity") || "";
    const action = searchParams.get("action") || "";

    const query: Record<string, unknown> = {
      organizationId: authUser.organizationId,
    };

    if (entity) query.entity = entity;
    if (action) query.action = action;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query),
    ]);

    return NextResponse.json({
      ok: true,
      logs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get audit log error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit log." },
      { status: 500 }
    );
  }
}
