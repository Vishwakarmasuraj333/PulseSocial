import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const ProfileSchema = z.object({
  name: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = ProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(validated.data.name ? { name: validated.data.name } : {}),
        ...(validated.data.avatarUrl !== undefined ? { avatarUrl: validated.data.avatarUrl } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        avatarUrl: updated.avatarUrl,
      },
    });
  } catch (error: unknown) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
