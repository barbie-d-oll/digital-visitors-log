import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import User from "@/lib/models/user.model";

export async function POST() {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    await connectToDB();

    await User.findByIdAndUpdate(authUser.userId, {
      $set: { hasCompletedTour: true },
    });

    return NextResponse.json({
      ok: true,
      message: "Tour status marked as completed.",
    });
  } catch (error) {
    console.error("Complete tour error:", error);
    return NextResponse.json(
      { error: "Failed to update tour status." },
      { status: 500 }
    );
  }
}
