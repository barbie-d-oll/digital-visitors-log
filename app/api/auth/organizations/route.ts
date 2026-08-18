import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Membership from "@/lib/models/membership.model";
import Organization from "@/lib/models/organization.model";

/**
 * Returns all organizations the current user belongs to.
 */
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const memberships = await Membership.find({
      userId: authUser.userId,
      status: "active",
    }).lean();

    const orgIds = memberships.map((m) => m.organizationId);

    const organizations = await Organization.find({
      _id: { $in: orgIds },
      status: "active",
    })
      .select("name slug logo plan")
      .lean();

    const result = organizations.map((org) => {
      const membership = memberships.find(
        (m) => m.organizationId.toString() === org._id.toString()
      );
      return {
        id: org._id,
        name: org.name,
        slug: org.slug,
        logo: org.logo,
        plan: org.plan,
        role: membership?.role || "staff",
        isCurrent: org._id.toString() === authUser.organizationId,
      };
    });

    return NextResponse.json({ ok: true, organizations: result });
  } catch (error) {
    console.error("Get user orgs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations." },
      { status: 500 }
    );
  }
}
