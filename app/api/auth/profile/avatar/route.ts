import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth/jwt";
import { connectToDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";

export const runtime = "nodejs";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const userExists = await User.exists({
      _id: authUser.userId,
      organizationId: authUser.organizationId,
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const avatar = formData.get("avatar");

    if (!avatar || typeof avatar === "string") {
      return NextResponse.json(
        { error: "Please choose an image file." },
        { status: 400 },
      );
    }

    const extension = ALLOWED_AVATAR_TYPES.get(avatar.type);
    if (!extension) {
      return NextResponse.json(
        { error: "Avatar must be a PNG, JPG, WEBP, or GIF image." },
        { status: 400 },
      );
    }

    if (avatar.size > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        { error: "Avatar must be 2MB or smaller." },
        { status: 400 },
      );
    }

    const fileName = `${authUser.userId}-${Date.now()}-${randomUUID()}.${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    const uploadPath = path.join(uploadDir, fileName);
    const avatarUrl = `/uploads/avatars/${fileName}`;

    await mkdir(uploadDir, { recursive: true });
    await writeFile(uploadPath, Buffer.from(await avatar.arrayBuffer()));

    await User.updateOne(
      { _id: authUser.userId, organizationId: authUser.organizationId },
      { $set: { avatar: avatarUrl } },
    );

    return NextResponse.json({ ok: true, avatarUrl });
  } catch (error) {
    console.error("Upload avatar error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar." },
      { status: 500 },
    );
  }
}
